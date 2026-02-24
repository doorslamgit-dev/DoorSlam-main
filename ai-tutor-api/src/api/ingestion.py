# ai-tutor-api/src/api/ingestion.py
# Admin-only ingestion API endpoints (service_role key auth).

import asyncio

from fastapi import APIRouter, Header, HTTPException, Query
from supabase import create_client

from ..config import settings
from ..models.ingestion import (
    BatchIngestRequest,
    BatchIngestResponse,
    DocumentListItem,
    DocumentListResponse,
    JobStatusResponse,
)
from ..services.batch_ingestion import ingest_from_drive

router = APIRouter()


def _verify_service_key(authorization: str = Header(...)) -> None:
    """Verify the request uses the service_role key (not a regular JWT)."""
    token = authorization.replace("Bearer ", "")
    if token != settings.supabase_service_role_key:
        raise HTTPException(status_code=403, detail="Service role key required")


@router.post("/batch", response_model=BatchIngestResponse)
async def start_batch_ingestion(
    req: BatchIngestRequest,
    authorization: str = Header(...),
):
    """Kick off a batch ingestion from a Google Drive folder.

    Auth: requires service_role key in Authorization header.
    """
    _verify_service_key(authorization)

    # Start ingestion as a background task
    job_id_future: asyncio.Future[str] = asyncio.get_event_loop().create_future()

    async def run_ingestion():
        try:
            job_id = await ingest_from_drive(
                root_folder_id=req.root_folder_id,
                batch_label=req.batch_label,
                concurrency=req.concurrency,
            )
            if not job_id_future.done():
                job_id_future.set_result(job_id)
        except Exception as exc:
            if not job_id_future.done():
                job_id_future.set_exception(exc)

    asyncio.create_task(run_ingestion())

    # Wait briefly for the job ID (it's created at the start of ingest_from_drive)
    try:
        job_id = await asyncio.wait_for(job_id_future, timeout=5.0)
    except asyncio.TimeoutError:
        raise HTTPException(status_code=500, detail="Ingestion failed to start")

    return BatchIngestResponse(job_id=job_id)


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(
    job_id: str,
    authorization: str = Header(...),
):
    """Get the status of an ingestion job."""
    _verify_service_key(authorization)

    sb = create_client(settings.supabase_url, settings.supabase_service_role_key)
    result = (
        sb.schema("rag")
        .table("ingestion_jobs")
        .select("*")
        .eq("id", job_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")

    job = result.data[0]
    return JobStatusResponse(
        id=job["id"],
        batch_label=job.get("batch_label"),
        status=job["status"],
        total_documents=job.get("total_documents", 0),
        processed_documents=job.get("processed_documents", 0),
        failed_documents=job.get("failed_documents", 0),
        total_chunks=job.get("total_chunks", 0),
        error_log=job.get("error_log", []),
        started_at=job.get("started_at"),
        completed_at=job.get("completed_at"),
    )


@router.get("/documents", response_model=DocumentListResponse)
async def list_documents(
    authorization: str = Header(...),
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    status: str | None = Query(default=None),
    subject_id: str | None = Query(default=None),
):
    """List ingested documents with optional filters."""
    _verify_service_key(authorization)

    sb = create_client(settings.supabase_url, settings.supabase_service_role_key)
    query = (
        sb.schema("rag")
        .table("documents")
        .select("id, title, source_type, status, chunk_count, subject_id, created_at")
        .order("created_at", desc=True)
        .range(offset, offset + limit)
    )

    if status:
        query = query.eq("status", status)
    if subject_id:
        query = query.eq("subject_id", subject_id)

    result = query.execute()
    docs = result.data or []

    return DocumentListResponse(
        documents=[
            DocumentListItem(
                id=d["id"],
                title=d["title"],
                source_type=d["source_type"],
                status=d["status"],
                chunk_count=d.get("chunk_count", 0),
                subject_id=d.get("subject_id"),
                created_at=d["created_at"],
            )
            for d in docs
        ],
        has_more=len(docs) == limit + 1,
    )
