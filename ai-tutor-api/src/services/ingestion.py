# ai-tutor-api/src/services/ingestion.py
# Per-document ingestion pipeline: parse → chunk → embed → store.

import hashlib
import logging
import uuid
from datetime import datetime, timedelta, timezone

from supabase import create_client

from ..config import settings
from .chunker import chunk_text
from .embedder import embed_chunks
from .parser import parse_document

logger = logging.getLogger(__name__)


def _get_supabase():
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def upload_to_storage(file_bytes: bytes, file_key: str) -> None:
    """Upload a file to the exam-documents Storage bucket.

    Args:
        file_bytes: Raw file content.
        file_key: Storage path (e.g. "aqa/gcse/8461/spec/8461_specification.pdf").
    """
    sb = _get_supabase()
    sb.storage.from_("exam-documents").upload(
        file_key,
        file_bytes,
        {"content-type": "application/pdf"},
    )
    logger.info("Uploaded to Storage: %s", file_key)


async def ingest_document(
    file_bytes: bytes,
    filename: str,
    title: str,
    source_type: str,
    source_path: str,
    subject_id: str | None = None,
    topic_id: str | None = None,
    exam_board_id: str | None = None,
    qualification_id: str | None = None,
    provider: str | None = None,
    year: int | None = None,
    exam_spec_version_id: str | None = None,
    exam_pathway_id: str | None = None,
    session: str | None = None,
    paper_number: str | None = None,
    doc_type: str | None = None,
    file_key: str | None = None,
    drive_file_id: str | None = None,
    drive_md5_checksum: str | None = None,
    drive_modified_time: str | None = None,
) -> str:
    """Parse, chunk, embed, and store a single document.

    Returns the document ID. Raises on failure.
    """
    sb = _get_supabase()

    # 1. Hash file for deduplication
    content_hash = hashlib.sha256(file_bytes).hexdigest()

    # Check for duplicate
    existing = (
        sb.schema("rag")
        .table("documents")
        .select("id")
        .eq("content_hash", content_hash)
        .execute()
    )
    if existing.data:
        logger.info("Duplicate detected (hash=%s), skipping: %s", content_hash[:12], filename)
        return existing.data[0]["id"]

    # 2. Upload original to Storage (if file_key provided)
    if file_key:
        try:
            upload_to_storage(file_bytes, file_key)
        except Exception as exc:
            logger.warning("Storage upload failed for %s: %s", file_key, exc)
            # Continue with ingestion — Storage upload is non-blocking

    # 3. Create document row (status: processing)
    doc_id = str(uuid.uuid4())
    doc_row = {
        "id": doc_id,
        "title": title,
        "source_type": source_type,
        "source_path": source_path,
        "provider": provider,
        "year": year,
        "subject_id": subject_id,
        "topic_id": topic_id,
        "exam_board_id": exam_board_id,
        "qualification_id": qualification_id,
        "content_hash": content_hash,
        "file_size": len(file_bytes),
        "status": "processing",
        "metadata": {},
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    # Add new schema-aligned columns (only if not None)
    if exam_spec_version_id:
        doc_row["exam_spec_version_id"] = exam_spec_version_id
    if exam_pathway_id:
        doc_row["exam_pathway_id"] = exam_pathway_id
    if session:
        doc_row["session"] = session
    if paper_number:
        doc_row["paper_number"] = paper_number
    if doc_type:
        doc_row["doc_type"] = doc_type
    if file_key:
        doc_row["file_key"] = file_key
    if drive_file_id:
        doc_row["drive_file_id"] = drive_file_id
    if drive_md5_checksum:
        doc_row["drive_md5_checksum"] = drive_md5_checksum
    if drive_modified_time:
        doc_row["drive_modified_time"] = drive_modified_time

    sb.schema("rag").table("documents").insert(doc_row).execute()

    try:
        # 4. Parse document text
        parsed = parse_document(file_bytes, filename)

        # 5. Chunk text
        chunks = chunk_text(parsed.text)

        if not chunks:
            logger.warning("No chunks produced for document: %s", filename)
            sb.schema("rag").table("documents").update({
                "status": "completed",
                "chunk_count": 0,
                "metadata": parsed.metadata,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }).eq("id", doc_id).execute()
            return doc_id

        # 6. Generate embeddings
        texts = [c.content for c in chunks]
        embeddings = await embed_chunks(texts)

        # 7. Insert chunks with embeddings
        chunk_rows = []
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            chunk_rows.append({
                "document_id": doc_id,
                "chunk_index": i,
                "content": chunk.content,
                "content_hash": chunk.content_hash,
                "token_count": chunk.token_count,
                "embedding": embedding,
                "subject_id": subject_id,
                "topic_id": topic_id,
                "exam_board_id": exam_board_id,
                "metadata": {"page": None},
            })

        # Insert in batches of 50 to avoid payload limits
        for i in range(0, len(chunk_rows), 50):
            batch = chunk_rows[i:i + 50]
            sb.schema("rag").table("chunks").insert(batch).execute()

        # 8. Update document status
        sb.schema("rag").table("documents").update({
            "status": "completed",
            "chunk_count": len(chunks),
            "metadata": {
                **parsed.metadata,
                "page_count": parsed.page_count,
            },
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", doc_id).execute()

        logger.info(
            "Ingested %s: %d chunks, %d embeddings",
            filename, len(chunks), len(embeddings),
        )
        return doc_id

    except Exception as exc:
        # 9. Mark as failed
        sb.schema("rag").table("documents").update({
            "status": "failed",
            "error_message": str(exc),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", doc_id).execute()
        raise


async def update_document(
    doc_id: str,
    file_bytes: bytes,
    filename: str,
    subject_id: str | None = None,
    topic_id: str | None = None,
    exam_board_id: str | None = None,
    drive_md5_checksum: str | None = None,
    drive_modified_time: str | None = None,
    file_key: str | None = None,
) -> str:
    """Re-ingest a modified document, preserving its UUID.

    Deletes old chunks, re-parses, re-chunks, re-embeds, and updates
    the document row with the new content hash and chunk count.

    Returns the document ID.
    """
    sb = _get_supabase()
    now = datetime.now(timezone.utc).isoformat()

    # 1. Mark as processing
    sb.schema("rag").table("documents").update({
        "status": "processing",
        "updated_at": now,
    }).eq("id", doc_id).execute()

    try:
        # 2. Delete old chunks
        sb.schema("rag").table("chunks").delete().eq("document_id", doc_id).execute()

        # 3. Recompute content hash
        content_hash = hashlib.sha256(file_bytes).hexdigest()

        # 4. Replace file in Storage (if file_key provided)
        if file_key:
            try:
                sb.storage.from_("exam-documents").remove([file_key])
            except Exception:
                pass  # Old file may not exist
            try:
                upload_to_storage(file_bytes, file_key)
            except Exception as exc:
                logger.warning("Storage re-upload failed for %s: %s", file_key, exc)

        # 5. Parse, chunk, embed
        parsed = parse_document(file_bytes, filename)
        chunks = chunk_text(parsed.text)

        if not chunks:
            sb.schema("rag").table("documents").update({
                "status": "completed",
                "content_hash": content_hash,
                "chunk_count": 0,
                "file_size": len(file_bytes),
                "drive_md5_checksum": drive_md5_checksum,
                "drive_modified_time": drive_modified_time,
                "metadata": parsed.metadata,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }).eq("id", doc_id).execute()
            return doc_id

        texts = [c.content for c in chunks]
        embeddings = await embed_chunks(texts)

        # 6. Insert new chunks
        chunk_rows = []
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            chunk_rows.append({
                "document_id": doc_id,
                "chunk_index": i,
                "content": chunk.content,
                "content_hash": chunk.content_hash,
                "token_count": chunk.token_count,
                "embedding": embedding,
                "subject_id": subject_id,
                "topic_id": topic_id,
                "exam_board_id": exam_board_id,
                "metadata": {"page": None},
            })

        for i in range(0, len(chunk_rows), 50):
            batch = chunk_rows[i:i + 50]
            sb.schema("rag").table("chunks").insert(batch).execute()

        # 7. Update document row
        sb.schema("rag").table("documents").update({
            "status": "completed",
            "content_hash": content_hash,
            "chunk_count": len(chunks),
            "file_size": len(file_bytes),
            "drive_md5_checksum": drive_md5_checksum,
            "drive_modified_time": drive_modified_time,
            "metadata": {**parsed.metadata, "page_count": parsed.page_count},
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", doc_id).execute()

        logger.info(
            "Updated %s (doc_id=%s): %d chunks re-embedded",
            filename, doc_id, len(chunks),
        )
        return doc_id

    except Exception as exc:
        sb.schema("rag").table("documents").update({
            "status": "failed",
            "error_message": str(exc),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", doc_id).execute()
        raise


def soft_delete_document(doc_id: str) -> None:
    """Mark a document as deleted (soft-delete).

    The document is immediately excluded from search results because
    search_chunks() filters WHERE d.status = 'completed'.
    """
    sb = _get_supabase()
    now = datetime.now(timezone.utc).isoformat()
    sb.schema("rag").table("documents").update({
        "status": "deleted",
        "deleted_at": now,
        "updated_at": now,
    }).eq("id", doc_id).execute()
    logger.info("Soft-deleted document: %s", doc_id)


def cleanup_deleted_documents(older_than_days: int = 30) -> int:
    """Hard-delete documents that were soft-deleted more than N days ago.

    ON DELETE CASCADE on chunks handles chunk cleanup automatically.
    Returns the count of deleted documents.
    """
    sb = _get_supabase()
    cutoff = (datetime.now(timezone.utc) - timedelta(days=older_than_days)).isoformat()

    # Find documents to delete
    result = (
        sb.schema("rag")
        .table("documents")
        .select("id")
        .eq("status", "deleted")
        .lt("deleted_at", cutoff)
        .execute()
    )

    count = len(result.data) if result.data else 0
    if count > 0:
        ids = [d["id"] for d in result.data]
        for doc_id in ids:
            sb.schema("rag").table("documents").delete().eq("id", doc_id).execute()
        logger.info("Cleaned up %d soft-deleted documents (older than %d days)", count, older_than_days)

    return count
