-- Module 5: Document enrichment columns + updated search_chunks()
-- Adds document-level summary and key_points for richer RAG context.

-- Set search_path to include extensions (where pgvector 'vector' type lives)
SET search_path TO rag, public, extensions;

-- =========================================================================
-- 1. Add enrichment columns to rag.documents
-- =========================================================================

ALTER TABLE rag.documents ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE rag.documents ADD COLUMN IF NOT EXISTS key_points JSONB DEFAULT '[]'::jsonb;

-- =========================================================================
-- 2. Update search_chunks() to return summary + key_points
-- =========================================================================

-- Drop existing function first (signature change in RETURNS TABLE)
DROP FUNCTION IF EXISTS rag.search_chunks(
    vector(2000), INTEGER, FLOAT,
    UUID, UUID, UUID, TEXT, INTEGER, UUID, TEXT
);

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
    doc_exam_pathway_id UUID,
    doc_summary TEXT,
    doc_key_points JSONB
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.document_id, c.content,
           (1 - (c.embedding <=> query_embedding))::FLOAT AS similarity,
           d.title, d.source_type, c.subject_id, c.topic_id,
           c.metadata, d.metadata,
           d.year, d.session, d.paper_number, d.doc_type,
           d.file_key, d.exam_pathway_id,
           d.summary, d.key_points
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
-- 3. Re-grant permissions
-- =========================================================================

GRANT EXECUTE ON FUNCTION rag.search_chunks TO authenticated;
GRANT EXECUTE ON FUNCTION rag.search_chunks TO service_role;
