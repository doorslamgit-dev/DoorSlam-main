-- Schema alignment: extend rag.documents with exam metadata + update search_chunks()
-- Adds FK columns for exam_spec_versions/exam_pathways, session/paper/doc_type/file_key,
-- expands source_type CHECK, adds indexes, and enhances the search function.

SET search_path TO rag, public, extensions;

-- =========================================================================
-- 1. New columns on rag.documents
-- =========================================================================

ALTER TABLE rag.documents
    ADD COLUMN IF NOT EXISTS exam_spec_version_id UUID
        REFERENCES public.exam_spec_versions(id),
    ADD COLUMN IF NOT EXISTS exam_pathway_id UUID
        REFERENCES public.exam_pathways(id),
    ADD COLUMN IF NOT EXISTS session TEXT,
    ADD COLUMN IF NOT EXISTS paper_number TEXT,
    ADD COLUMN IF NOT EXISTS doc_type TEXT,
    ADD COLUMN IF NOT EXISTS file_key TEXT;

-- =========================================================================
-- 2. Constraints
-- =========================================================================

-- Session must be one of the known exam sessions (or NULL for non-paper docs)
ALTER TABLE rag.documents
    ADD CONSTRAINT chk_documents_session
    CHECK (session IS NULL OR session IN ('jun', 'nov', 'mar', 'jan'));

-- doc_type must match our known document types (or NULL)
ALTER TABLE rag.documents
    ADD CONSTRAINT chk_documents_doc_type
    CHECK (doc_type IS NULL OR doc_type IN ('qp', 'ms', 'er', 'gt', 'sp', 'spec', 'rev'));

-- Expand source_type CHECK to include 'sample_paper'
-- Must drop and re-add because ALTER CHECK is not supported
ALTER TABLE rag.documents
    DROP CONSTRAINT IF EXISTS documents_source_type_check;

ALTER TABLE rag.documents
    ADD CONSTRAINT documents_source_type_check
    CHECK (source_type IN (
        'past_paper', 'specification', 'revision', 'marking_scheme',
        'examiner_report', 'grade_threshold', 'sample_paper'
    ));

-- =========================================================================
-- 3. Indexes for new columns
-- =========================================================================

CREATE INDEX IF NOT EXISTS idx_documents_year
    ON rag.documents(year);
CREATE INDEX IF NOT EXISTS idx_documents_doc_type
    ON rag.documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_session
    ON rag.documents(session);
CREATE INDEX IF NOT EXISTS idx_documents_exam_pathway
    ON rag.documents(exam_pathway_id);
CREATE INDEX IF NOT EXISTS idx_documents_spec_version
    ON rag.documents(exam_spec_version_id);
CREATE INDEX IF NOT EXISTS idx_documents_source_type
    ON rag.documents(source_type);
CREATE INDEX IF NOT EXISTS idx_documents_file_key
    ON rag.documents(file_key);

-- =========================================================================
-- 4. Updated search_chunks() — add new filters and return columns
-- =========================================================================

DROP FUNCTION IF EXISTS rag.search_chunks;

CREATE OR REPLACE FUNCTION rag.search_chunks(
    query_embedding vector(2000),
    match_count INTEGER DEFAULT 5,
    similarity_threshold FLOAT DEFAULT 0.7,
    filter_subject_id UUID DEFAULT NULL,
    filter_topic_id UUID DEFAULT NULL,
    filter_exam_board_id UUID DEFAULT NULL,
    filter_source_type TEXT DEFAULT NULL,
    filter_year INTEGER DEFAULT NULL,
    filter_exam_pathway_id UUID DEFAULT NULL,
    filter_doc_type TEXT DEFAULT NULL
) RETURNS TABLE (
    id UUID,
    document_id UUID,
    content TEXT,
    similarity FLOAT,
    document_title TEXT,
    source_type TEXT,
    subject_id UUID,
    topic_id UUID,
    chunk_metadata JSONB,
    doc_metadata JSONB,
    doc_year INTEGER,
    doc_session TEXT,
    doc_paper_number TEXT,
    doc_type TEXT,
    doc_file_key TEXT,
    doc_exam_pathway_id UUID
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.document_id, c.content,
           (1 - (c.embedding <=> query_embedding))::FLOAT AS similarity,
           d.title, d.source_type, c.subject_id, c.topic_id,
           c.metadata, d.metadata,
           d.year, d.session, d.paper_number, d.doc_type,
           d.file_key, d.exam_pathway_id
    FROM rag.chunks c
    JOIN rag.documents d ON d.id = c.document_id
    WHERE c.embedding IS NOT NULL
      AND d.status = 'completed'
      AND (filter_subject_id IS NULL OR c.subject_id = filter_subject_id)
      AND (filter_topic_id IS NULL OR c.topic_id = filter_topic_id)
      AND (filter_exam_board_id IS NULL OR c.exam_board_id = filter_exam_board_id)
      AND (filter_source_type IS NULL OR d.source_type = filter_source_type)
      AND (filter_year IS NULL OR d.year = filter_year)
      AND (filter_exam_pathway_id IS NULL OR d.exam_pathway_id = filter_exam_pathway_id)
      AND (filter_doc_type IS NULL OR d.doc_type = filter_doc_type)
      AND 1 - (c.embedding <=> query_embedding) > similarity_threshold
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count;
END; $$;

-- =========================================================================
-- 5. Re-grant permissions (DROP FUNCTION removed previous grants)
-- =========================================================================

GRANT EXECUTE ON FUNCTION rag.search_chunks TO authenticated;
GRANT EXECUTE ON FUNCTION rag.search_chunks TO service_role;
