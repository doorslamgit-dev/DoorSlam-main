-- Module 2: BYO Retrieval + Memory — Documents, chunks, ingestion jobs
-- Adds document metadata, text chunks with embeddings, and batch job tracking

-- =========================================================================
-- rag.documents — Ingested file metadata
-- =========================================================================
CREATE TABLE rag.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN (
        'past_paper', 'specification', 'revision', 'marking_scheme',
        'examiner_report', 'grade_threshold'
    )),
    source_path TEXT,
    provider TEXT,
    year INTEGER,
    subject_id UUID REFERENCES public.subjects(id),
    topic_id UUID REFERENCES public.topics(id),
    exam_board_id UUID REFERENCES public.exam_boards(id),
    qualification_id UUID REFERENCES public.qualifications(id),
    content_hash TEXT NOT NULL,
    chunk_count INTEGER DEFAULT 0,
    file_size INTEGER,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT documents_content_hash_unique UNIQUE (content_hash)
);

-- =========================================================================
-- rag.chunks — Text chunks with inline embeddings
-- =========================================================================
CREATE TABLE rag.chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES rag.documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    token_count INTEGER,
    embedding vector(1536),
    subject_id UUID REFERENCES public.subjects(id),
    topic_id UUID REFERENCES public.topics(id),
    exam_board_id UUID REFERENCES public.exam_boards(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================================================
-- rag.ingestion_jobs — Batch progress tracking
-- =========================================================================
CREATE TABLE rag.ingestion_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_label TEXT,
    status TEXT NOT NULL DEFAULT 'queued'
        CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
    total_documents INTEGER DEFAULT 0,
    processed_documents INTEGER DEFAULT 0,
    failed_documents INTEGER DEFAULT 0,
    total_chunks INTEGER DEFAULT 0,
    error_log JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================================================
-- Indexes
-- =========================================================================

-- Vector similarity (IVFFlat — adequate for <100K chunks)
CREATE INDEX idx_chunks_embedding ON rag.chunks
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Pre-filter indexes for scoped retrieval
CREATE INDEX idx_chunks_subject ON rag.chunks(subject_id);
CREATE INDEX idx_chunks_topic ON rag.chunks(topic_id);
CREATE INDEX idx_chunks_exam_board ON rag.chunks(exam_board_id);
CREATE INDEX idx_chunks_document ON rag.chunks(document_id);

-- Document lookups
CREATE INDEX idx_documents_content_hash ON rag.documents(content_hash);
CREATE INDEX idx_documents_status ON rag.documents(status);
CREATE INDEX idx_documents_subject ON rag.documents(subject_id);

-- Ingestion job tracking
CREATE INDEX idx_ingestion_jobs_status ON rag.ingestion_jobs(status);

-- =========================================================================
-- rag.search_chunks() — Vector similarity search function
-- =========================================================================
CREATE OR REPLACE FUNCTION rag.search_chunks(
    query_embedding vector(1536),
    match_count INTEGER DEFAULT 5,
    similarity_threshold FLOAT DEFAULT 0.7,
    filter_subject_id UUID DEFAULT NULL,
    filter_topic_id UUID DEFAULT NULL,
    filter_exam_board_id UUID DEFAULT NULL
) RETURNS TABLE (
    id UUID, document_id UUID, content TEXT, similarity FLOAT,
    document_title TEXT, source_type TEXT, subject_id UUID,
    topic_id UUID, chunk_metadata JSONB, doc_metadata JSONB
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.document_id, c.content,
           (1 - (c.embedding <=> query_embedding))::FLOAT AS similarity,
           d.title, d.source_type, c.subject_id, c.topic_id,
           c.metadata, d.metadata
    FROM rag.chunks c
    JOIN rag.documents d ON d.id = c.document_id
    WHERE c.embedding IS NOT NULL
      AND d.status = 'completed'
      AND (filter_subject_id IS NULL OR c.subject_id = filter_subject_id)
      AND (filter_topic_id IS NULL OR c.topic_id = filter_topic_id)
      AND (filter_exam_board_id IS NULL OR c.exam_board_id = filter_exam_board_id)
      AND 1 - (c.embedding <=> query_embedding) > similarity_threshold
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count;
END; $$;

-- =========================================================================
-- RLS Policies
-- =========================================================================

-- Documents: authenticated can read, service_role can do everything
ALTER TABLE rag.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_read" ON rag.documents FOR SELECT
    USING (auth.role() = 'authenticated');
CREATE POLICY "documents_service" ON rag.documents FOR ALL
    USING (auth.role() = 'service_role');

-- Chunks: authenticated can read, service_role can do everything
ALTER TABLE rag.chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chunks_read" ON rag.chunks FOR SELECT
    USING (auth.role() = 'authenticated');
CREATE POLICY "chunks_service" ON rag.chunks FOR ALL
    USING (auth.role() = 'service_role');

-- Ingestion jobs: service_role only
ALTER TABLE rag.ingestion_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs_service" ON rag.ingestion_jobs FOR ALL
    USING (auth.role() = 'service_role');

-- =========================================================================
-- Permissions (PostgREST roles)
-- =========================================================================
GRANT ALL ON rag.documents TO service_role;
GRANT SELECT ON rag.documents TO authenticated;
GRANT ALL ON rag.chunks TO service_role;
GRANT SELECT ON rag.chunks TO authenticated;
GRANT ALL ON rag.ingestion_jobs TO service_role;

-- Grant execute on search function
GRANT EXECUTE ON FUNCTION rag.search_chunks TO authenticated;
GRANT EXECUTE ON FUNCTION rag.search_chunks TO service_role;

-- PostgREST anonymous role needs USAGE on rag schema (already granted in prior migration)
-- but also needs awareness of new tables for introspection
GRANT USAGE ON SCHEMA rag TO anon;
GRANT USAGE ON SCHEMA rag TO authenticated;
