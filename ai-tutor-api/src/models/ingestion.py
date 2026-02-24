# ai-tutor-api/src/models/ingestion.py
# Pydantic models for ingestion API endpoints.

from pydantic import BaseModel


class BatchIngestRequest(BaseModel):
    """Request body for POST /ingestion/batch."""

    root_folder_id: str
    batch_label: str | None = None
    concurrency: int = 5


class BatchIngestResponse(BaseModel):
    """Response for POST /ingestion/batch."""

    job_id: str


class JobStatusResponse(BaseModel):
    """Response for GET /ingestion/jobs/{job_id}."""

    id: str
    batch_label: str | None
    status: str
    total_documents: int
    processed_documents: int
    failed_documents: int
    total_chunks: int
    error_log: list
    started_at: str | None
    completed_at: str | None


class DocumentListItem(BaseModel):
    """A single document in the list response."""

    id: str
    title: str
    source_type: str
    status: str
    chunk_count: int
    subject_id: str | None
    created_at: str


class DocumentListResponse(BaseModel):
    """Response for GET /ingestion/documents."""

    documents: list[DocumentListItem]
    has_more: bool
