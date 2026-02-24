# ai-tutor-api/src/services/sync.py
# Incremental sync orchestrator — compare Drive state against DB, process only changes.

import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone

from supabase import create_client

from ..config import settings
from .batch_ingestion import _build_file_key
from .drive_walker import DriveFile, download_file, walk_drive
from .filename_parser import parse_filename
from .ingestion import ingest_document, soft_delete_document, update_document
from .metadata_resolver import resolve_metadata
from .path_parser import parse_drive_path, refine_source_type

logger = logging.getLogger(__name__)


def _get_supabase():
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def _classify_files(
    drive_files: list[DriveFile],
    db_docs: dict[str, dict],
) -> tuple[list[DriveFile], list[tuple[DriveFile, dict]], list[dict], int]:
    """Classify Drive files into new, modified, and unchanged.

    Also identifies deleted documents (in DB but not on Drive).

    Returns:
        (to_ingest, to_update, to_delete, unchanged_count)
    """
    to_ingest: list[DriveFile] = []
    to_update: list[tuple[DriveFile, dict]] = []
    unchanged = 0

    drive_file_ids = set()

    for df in drive_files:
        drive_file_ids.add(df.file_id)
        existing = db_docs.get(df.file_id)

        if existing is None:
            # New file — not seen before
            to_ingest.append(df)
        elif existing.get("drive_md5_checksum") != df.md5_checksum:
            # Modified — same Drive file ID but different content
            to_update.append((df, existing))
        else:
            unchanged += 1

    # Deleted — in DB but no longer on Drive
    to_delete = [
        doc for fid, doc in db_docs.items()
        if fid not in drive_file_ids and doc.get("status") != "deleted"
    ]

    return to_ingest, to_update, to_delete, unchanged


async def sync_from_drive(
    root_folder_id: str,
    batch_label: str | None = None,
    concurrency: int = 5,
    root_path: str = "",
) -> str:
    """Compare Drive folder state against DB, process only changes.

    Args:
        root_folder_id: Google Drive folder ID to sync from.
        batch_label: Optional label for this sync job.
        concurrency: Max parallel document processing tasks.
        root_path: Path prefix for folders above the start folder.

    Returns:
        The sync job ID.
    """
    sb = _get_supabase()

    # 1. Create sync job row
    job_id = str(uuid.uuid4())
    sb.schema("rag").table("ingestion_jobs").insert({
        "id": job_id,
        "batch_label": batch_label,
        "job_type": "sync",
        "root_folder_id": root_folder_id,
        "status": "running",
        "started_at": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    try:
        # 2. Walk Drive to get current file list
        drive_files = walk_drive(root_folder_id, root_path=root_path)

        # 3. Load existing documents with Drive identity from DB
        result = (
            sb.schema("rag")
            .table("documents")
            .select("id, drive_file_id, drive_md5_checksum, content_hash, status, "
                    "subject_id, topic_id, exam_board_id, file_key")
            .not_.is_("drive_file_id", "null")
            .execute()
        )
        db_docs = {d["drive_file_id"]: d for d in (result.data or [])}

        # 4. Classify files
        to_ingest, to_update, to_delete, unchanged = _classify_files(
            drive_files, db_docs,
        )

        total = len(to_ingest) + len(to_update) + len(to_delete)
        sb.schema("rag").table("ingestion_jobs").update({
            "total_documents": total,
        }).eq("id", job_id).execute()

        logger.info(
            "Sync classified %d files: %d new, %d modified, %d deleted, %d unchanged",
            len(drive_files), len(to_ingest), len(to_update),
            len(to_delete), unchanged,
        )

        # 5. Process changes
        semaphore = asyncio.Semaphore(concurrency)
        processed = 0
        failed = 0
        errors: list[dict] = []

        async def _process_new(df: DriveFile) -> None:
            nonlocal processed, failed
            async with semaphore:
                try:
                    path_meta = parse_drive_path(df.path)
                    filename_meta = parse_filename(df.name)
                    source_type = refine_source_type(
                        path_meta.source_type, filename_meta.doc_type,
                    )
                    resolved = resolve_metadata(
                        exam_board_code=path_meta.exam_board_code,
                        qualification_code=path_meta.qualification_code,
                        subject_code=path_meta.subject_code,
                        source_type=source_type,
                        provider=path_meta.provider,
                        year=path_meta.year,
                        filename=path_meta.filename,
                        source_path=df.path,
                        filename_meta=filename_meta,
                    )
                    file_key = _build_file_key(
                        board_code=path_meta.exam_board_code,
                        qual_code=path_meta.qualification_code,
                        spec_code=path_meta.subject_code,
                        source_type=resolved.source_type,
                        year=resolved.year,
                        filename=df.name,
                    )
                    file_bytes = download_file(df.file_id)

                    await ingest_document(
                        file_bytes=file_bytes,
                        filename=df.name,
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
                        drive_file_id=df.file_id,
                        drive_md5_checksum=df.md5_checksum,
                        drive_modified_time=df.modified_time,
                    )
                    processed += 1
                except Exception as exc:
                    failed += 1
                    errors.append({
                        "file": df.path,
                        "action": "ingest",
                        "error": str(exc),
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    })
                    logger.error("Sync: failed to ingest new file %s: %s", df.path, exc)

        async def _process_update(df: DriveFile, doc: dict) -> None:
            nonlocal processed, failed
            async with semaphore:
                try:
                    file_bytes = download_file(df.file_id)
                    await update_document(
                        doc_id=doc["id"],
                        file_bytes=file_bytes,
                        filename=df.name,
                        subject_id=doc.get("subject_id"),
                        topic_id=doc.get("topic_id"),
                        exam_board_id=doc.get("exam_board_id"),
                        drive_md5_checksum=df.md5_checksum,
                        drive_modified_time=df.modified_time,
                        file_key=doc.get("file_key"),
                    )
                    processed += 1
                except Exception as exc:
                    failed += 1
                    errors.append({
                        "file": df.path,
                        "action": "update",
                        "error": str(exc),
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    })
                    logger.error("Sync: failed to update %s: %s", df.path, exc)

        # Run new + update tasks concurrently
        tasks = [_process_new(df) for df in to_ingest]
        tasks += [_process_update(df, doc) for df, doc in to_update]
        await asyncio.gather(*tasks)

        # 6. Soft-delete removed files (synchronous, fast)
        deleted = 0
        for doc in to_delete:
            try:
                soft_delete_document(doc["id"])
                deleted += 1
            except Exception as exc:
                failed += 1
                errors.append({
                    "doc_id": doc["id"],
                    "action": "delete",
                    "error": str(exc),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
                logger.error("Sync: failed to soft-delete %s: %s", doc["id"], exc)

        # 7. Update job with sync stats
        sync_stats = {
            "added": len(to_ingest) - sum(1 for e in errors if e.get("action") == "ingest"),
            "updated": len(to_update) - sum(1 for e in errors if e.get("action") == "update"),
            "deleted": deleted,
            "unchanged": unchanged,
        }

        sb.schema("rag").table("ingestion_jobs").update({
            "status": "completed",
            "processed_documents": processed + deleted,
            "failed_documents": failed,
            "sync_stats": sync_stats,
            "error_log": errors,
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", job_id).execute()

        logger.info(
            "Sync %s complete: +%d added, ~%d updated, -%d deleted, =%d unchanged, %d failed",
            job_id, sync_stats["added"], sync_stats["updated"],
            sync_stats["deleted"], unchanged, failed,
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
        logger.error("Sync failed: %s", exc)
        raise

    return job_id
