# ai-tutor-api/src/services/batch_ingestion.py
# Batch processing orchestrator — walks Drive, downloads, and ingests all files.

import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone

from supabase import create_client

from ..config import settings
from .drive_walker import DriveFile, download_file, walk_drive
from .filename_parser import parse_filename
from .ingestion import ingest_document
from .metadata_resolver import resolve_metadata
from .path_parser import parse_drive_path, refine_source_type

logger = logging.getLogger(__name__)


def _get_supabase():
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def _build_file_key(
    board_code: str,
    qual_code: str,
    spec_code: str,
    source_type: str,
    year: int | None,
    filename: str,
) -> str:
    """Build a Supabase Storage path for the original PDF.

    Examples:
        aqa/gcse/8461/spec/8461_specification.pdf
        aqa/gcse/8461/papers/2024/8461_2024_jun_p1_higher_qp.pdf
        aqa/gcse/8300/revision/sme/8300_sme_01_number.pdf
    """
    base = f"{board_code.lower()}/{qual_code.lower()}/{spec_code.lower()}"

    # Map source_type to folder segment
    folder_map = {
        "specification": "spec",
        "past_paper": "papers",
        "marking_scheme": "papers",
        "examiner_report": "papers",
        "grade_threshold": "papers",
        "sample_paper": "papers",
        "revision": "revision",
    }
    folder = folder_map.get(source_type, "other")

    if folder == "papers" and year:
        return f"{base}/{folder}/{year}/{filename.lower()}"
    return f"{base}/{folder}/{filename.lower()}"


async def ingest_from_drive(
    root_folder_id: str,
    batch_label: str | None = None,
    concurrency: int = 5,
    root_path: str = "",
) -> str:
    """Walk Drive folder, download, and ingest all files.

    Args:
        root_folder_id: Google Drive folder ID to start from.
        batch_label: Optional label for this ingestion batch.
        concurrency: Max parallel document processing tasks.
        root_path: Path prefix for folders above the start folder.
            e.g., "AQA/GCSE/Biology(8461)" when starting from a subject folder.

    Returns:
        The ingestion job ID.
    """
    sb = _get_supabase()

    # Create job row
    job_id = str(uuid.uuid4())
    sb.schema("rag").table("ingestion_jobs").insert({
        "id": job_id,
        "batch_label": batch_label,
        "status": "running",
        "started_at": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    try:
        # Walk Drive to discover files
        files = walk_drive(root_folder_id, root_path=root_path)

        sb.schema("rag").table("ingestion_jobs").update({
            "total_documents": len(files),
        }).eq("id", job_id).execute()

        # Process files with concurrency limit
        semaphore = asyncio.Semaphore(concurrency)
        processed = 0
        failed = 0
        total_chunks = 0
        errors: list[dict] = []

        async def process_file(drive_file: DriveFile) -> None:
            nonlocal processed, failed, total_chunks

            async with semaphore:
                try:
                    # 1. Parse folder path for metadata
                    path_meta = parse_drive_path(drive_file.path)

                    # 2. Parse filename for fine-grained metadata
                    filename_meta = parse_filename(drive_file.name)

                    # 3. Refine source_type using doc_type from filename
                    source_type = refine_source_type(
                        path_meta.source_type, filename_meta.doc_type
                    )

                    # 4. Resolve codes to database UUIDs
                    resolved = resolve_metadata(
                        exam_board_code=path_meta.exam_board_code,
                        qualification_code=path_meta.qualification_code,
                        subject_code=path_meta.subject_code,
                        source_type=source_type,
                        provider=path_meta.provider,
                        year=path_meta.year,
                        filename=path_meta.filename,
                        source_path=drive_file.path,
                        filename_meta=filename_meta,
                    )

                    # 5. Build Storage path
                    file_key = _build_file_key(
                        board_code=path_meta.exam_board_code,
                        qual_code=path_meta.qualification_code,
                        spec_code=path_meta.subject_code,
                        source_type=resolved.source_type,
                        year=resolved.year,
                        filename=drive_file.name,
                    )

                    # 6. Download file content
                    file_bytes = download_file(drive_file.file_id)

                    # 7. Ingest (includes Storage upload + chunk/embed/store)
                    await ingest_document(
                        file_bytes=file_bytes,
                        filename=drive_file.name,
                        title=resolved.title,
                        source_type=resolved.source_type,
                        source_path=resolved.source_path,
                        subject_id=resolved.subject_id,
                        topic_id=resolved.topic_id,
                        exam_board_id=resolved.exam_board_id,
                        qualification_id=resolved.qualification_id,
                        provider=resolved.provider,
                        year=resolved.year,
                        exam_spec_version_id=resolved.exam_spec_version_id,
                        exam_pathway_id=resolved.exam_pathway_id,
                        session=resolved.session,
                        paper_number=resolved.paper_number,
                        doc_type=resolved.doc_type,
                        file_key=file_key,
                    )

                    processed += 1

                except Exception as exc:
                    failed += 1
                    errors.append({
                        "file": drive_file.path,
                        "error": str(exc),
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    })
                    logger.error("Failed to ingest %s: %s", drive_file.path, exc)

                # Update progress
                sb.schema("rag").table("ingestion_jobs").update({
                    "processed_documents": processed,
                    "failed_documents": failed,
                    "error_log": errors,
                }).eq("id", job_id).execute()

        # Run all tasks
        tasks = [process_file(f) for f in files]
        await asyncio.gather(*tasks)

        # Count total chunks
        chunk_result = (
            sb.schema("rag")
            .table("chunks")
            .select("id", count="exact")
            .execute()
        )
        total_chunks = chunk_result.count or 0

        # Mark job complete
        sb.schema("rag").table("ingestion_jobs").update({
            "status": "completed",
            "processed_documents": processed,
            "failed_documents": failed,
            "total_chunks": total_chunks,
            "error_log": errors,
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", job_id).execute()

        logger.info(
            "Batch %s complete: %d processed, %d failed, %d total chunks",
            job_id, processed, failed, total_chunks,
        )

    except Exception as exc:
        sb.schema("rag").table("ingestion_jobs").update({
            "status": "failed",
            "error_log": json.loads(json.dumps([{
                "error": str(exc),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }])),
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", job_id).execute()
        logger.error("Batch ingestion failed: %s", exc)
        raise

    return job_id
