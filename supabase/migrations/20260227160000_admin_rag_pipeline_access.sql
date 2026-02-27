-- Migration: Admin read access to RAG pipeline tables + aggregation RPCs
-- Depends on: 20260227150000_add_admin_role.sql (admin enum value)
--             20260224120000_rag_module2_documents.sql (rag schema tables)

SET search_path TO rag, public, extensions;

-- ============================================================================
-- 1. Admin read access to rag.ingestion_jobs
-- ============================================================================
-- Currently only service_role can access ingestion_jobs. Admins need SELECT
-- to view pipeline job history in the dashboard.

GRANT SELECT ON rag.ingestion_jobs TO authenticated;

CREATE POLICY "admin_read_ingestion_jobs" ON rag.ingestion_jobs
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
  ));

-- ============================================================================
-- 2. RPC: Document stats aggregation by subject
-- ============================================================================
-- Aggregates rag.documents server-side to avoid transferring all rows.
-- Returns counts by status, doc_type, year, and enrichment completeness.

CREATE OR REPLACE FUNCTION rag.get_document_stats_for_subject(p_subject_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total', (
      SELECT COUNT(*) FROM rag.documents
      WHERE subject_id = p_subject_id AND status != 'deleted'
    ),
    'by_status', COALESCE((
      SELECT jsonb_object_agg(status, cnt)
      FROM (
        SELECT status, COUNT(*)::int AS cnt
        FROM rag.documents
        WHERE subject_id = p_subject_id AND status != 'deleted'
        GROUP BY status
      ) sub
    ), '{}'::jsonb),
    'by_doc_type', COALESCE((
      SELECT jsonb_object_agg(doc_type, cnt)
      FROM (
        SELECT doc_type, COUNT(*)::int AS cnt
        FROM rag.documents
        WHERE subject_id = p_subject_id AND status != 'deleted' AND doc_type IS NOT NULL
        GROUP BY doc_type
      ) sub
    ), '{}'::jsonb),
    'by_year', COALESCE((
      SELECT jsonb_object_agg(year::text, cnt)
      FROM (
        SELECT year, COUNT(*)::int AS cnt
        FROM rag.documents
        WHERE subject_id = p_subject_id AND status != 'deleted' AND year IS NOT NULL
        GROUP BY year
      ) sub
    ), '{}'::jsonb),
    'enriched_count', (
      SELECT COUNT(*)::int FROM rag.documents
      WHERE subject_id = p_subject_id AND status != 'deleted'
        AND summary IS NOT NULL AND summary != ''
    ),
    'missing_summary_count', (
      SELECT COUNT(*)::int FROM rag.documents
      WHERE subject_id = p_subject_id AND status != 'deleted'
        AND (summary IS NULL OR summary = '')
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- ============================================================================
-- 3. RPC: Chunk stats aggregation by subject
-- ============================================================================
-- Aggregates rag.chunks server-side — critical to avoid transferring
-- 2000-dimension embedding vectors to the client.

CREATE OR REPLACE FUNCTION rag.get_chunk_stats_for_subject(p_subject_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_chunks', (
      SELECT COUNT(*)::int FROM rag.chunks WHERE subject_id = p_subject_id
    ),
    'chunks_with_embedding', (
      SELECT COUNT(*)::int FROM rag.chunks
      WHERE subject_id = p_subject_id AND embedding IS NOT NULL
    ),
    'chunks_with_topic', (
      SELECT COUNT(*)::int FROM rag.chunks
      WHERE subject_id = p_subject_id AND topic_id IS NOT NULL
    ),
    'chunks_without_topic', (
      SELECT COUNT(*)::int FROM rag.chunks
      WHERE subject_id = p_subject_id AND topic_id IS NULL
    ),
    'unique_topics_covered', (
      SELECT COUNT(DISTINCT topic_id)::int FROM rag.chunks
      WHERE subject_id = p_subject_id AND topic_id IS NOT NULL
    ),
    'by_chunk_type', COALESCE((
      SELECT jsonb_object_agg(chunk_type, cnt)
      FROM (
        SELECT COALESCE(metadata->>'chunk_type', 'general') AS chunk_type, COUNT(*)::int AS cnt
        FROM rag.chunks
        WHERE subject_id = p_subject_id
        GROUP BY COALESCE(metadata->>'chunk_type', 'general')
      ) sub
    ), '{}'::jsonb),
    'by_document', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'document_id', c.document_id,
        'document_title', d.title,
        'doc_type', d.doc_type,
        'chunk_count', c.cnt
      ) ORDER BY c.cnt DESC)
      FROM (
        SELECT document_id, COUNT(*)::int AS cnt
        FROM rag.chunks
        WHERE subject_id = p_subject_id
        GROUP BY document_id
      ) c
      JOIN rag.documents d ON d.id = c.document_id
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

-- ============================================================================
-- 4. GRANTs for RPC functions
-- ============================================================================

GRANT EXECUTE ON FUNCTION rag.get_document_stats_for_subject(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION rag.get_chunk_stats_for_subject(UUID) TO authenticated;
