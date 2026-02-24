-- Module 3: Record Manager — Drive identity tracking, change detection, soft-delete
-- Adds drive_file_id/md5/modified_time to documents, extends ingestion_jobs for sync.

SET search_path TO rag, public, extensions;

-- =========================================================================
-- 1. Add Drive identity columns to rag.documents
-- =========================================================================

ALTER TABLE rag.documents
    ADD COLUMN IF NOT EXISTS drive_file_id TEXT,
    ADD COLUMN IF NOT EXISTS drive_md5_checksum TEXT,
    ADD COLUMN IF NOT EXISTS drive_modified_time TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- One document per Drive file (NULLs allowed for pre-Module 3 docs)
ALTER TABLE rag.documents
    ADD CONSTRAINT documents_drive_file_id_unique UNIQUE (drive_file_id);

CREATE INDEX IF NOT EXISTS idx_documents_drive_file_id
    ON rag.documents(drive_file_id);

-- =========================================================================
-- 2. Expand status CHECK to include 'deleted'
-- =========================================================================

-- Must drop and re-add because ALTER CHECK is not supported
ALTER TABLE rag.documents
    DROP CONSTRAINT IF EXISTS documents_status_check;

ALTER TABLE rag.documents
    ADD CONSTRAINT documents_status_check
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'deleted'));

-- =========================================================================
-- 3. Extend rag.ingestion_jobs for sync support
-- =========================================================================

ALTER TABLE rag.ingestion_jobs
    ADD COLUMN IF NOT EXISTS job_type TEXT DEFAULT 'batch'
        CHECK (job_type IN ('batch', 'sync')),
    ADD COLUMN IF NOT EXISTS sync_stats JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS root_folder_id TEXT;

-- Fast lookup: "when did we last sync this folder?"
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_folder
    ON rag.ingestion_jobs(root_folder_id, created_at DESC);
