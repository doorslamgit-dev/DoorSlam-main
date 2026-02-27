// src/services/pipelineAdminService.ts
// Service layer for content pipeline admin operations (phases 1-4).
// Queries the `rag` schema via supabase.schema('rag').

import { supabase } from '@/lib/supabase';
import type {
  ChunkStats,
  DocumentStats,
  IngestionJob,
  PhaseHealth,
  PipelinePhaseState,
} from '@/types/pipelineAdmin';
import type { ProductionComponent, StagingStatusCounts } from '@/types/curriculumAdmin';

// ---------------------------------------------------------------------------
// RAG-schema client
// ---------------------------------------------------------------------------

const rag = supabase.schema('rag');

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function fetchDocumentStats(subjectId: string): Promise<{
  data: DocumentStats | null;
  error: string | null;
}> {
  const { data, error } = await rag.rpc('get_document_stats_for_subject', {
    p_subject_id: subjectId,
  });

  if (error) return { data: null, error: error.message };
  return { data: data as DocumentStats, error: null };
}

export async function fetchChunkStats(subjectId: string): Promise<{
  data: ChunkStats | null;
  error: string | null;
}> {
  const { data, error } = await rag.rpc('get_chunk_stats_for_subject', {
    p_subject_id: subjectId,
  });

  if (error) return { data: null, error: error.message };
  return { data: data as ChunkStats, error: null };
}

export async function fetchRecentJobs(): Promise<{
  data: IngestionJob[];
  error: string | null;
}> {
  const { data, error } = await rag
    .from('ingestion_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as IngestionJob[], error: null };
}

// ---------------------------------------------------------------------------
// Pure helpers — compute pipeline phase health
// ---------------------------------------------------------------------------

export function computeDocumentPhaseHealth(
  stats: DocumentStats | null
): PipelinePhaseState {
  if (!stats || stats.total === 0) {
    return { health: 'empty', label: 'Documents', detail: 'No documents' };
  }

  const docTypes = Object.keys(stats.by_doc_type).length;
  const detail = `${stats.total} docs (${docTypes} types)`;

  return { health: 'complete', label: 'Documents', detail };
}

export function computeProcessingPhaseHealth(
  stats: DocumentStats | null
): PipelinePhaseState {
  if (!stats || stats.total === 0) {
    return { health: 'empty', label: 'Processing', detail: 'No documents' };
  }

  const completed = stats.by_status.completed ?? 0;
  const failed = stats.by_status.failed ?? 0;
  const pending = stats.by_status.pending ?? 0;
  const processing = stats.by_status.processing ?? 0;

  if (failed > 0) {
    return {
      health: 'error',
      label: 'Processing',
      detail: `${completed} completed, ${failed} failed`,
    };
  }

  if (pending > 0 || processing > 0) {
    return {
      health: 'partial',
      label: 'Processing',
      detail: `${completed} completed, ${pending + processing} in progress`,
    };
  }

  return {
    health: 'complete',
    label: 'Processing',
    detail: `${completed} completed`,
  };
}

export function computeEnrichmentPhaseHealth(
  docStats: DocumentStats | null,
  chunkStats: ChunkStats | null
): PipelinePhaseState {
  if (!docStats || docStats.total === 0) {
    return { health: 'empty', label: 'Enrichment', detail: 'No documents' };
  }

  const enriched = docStats.enriched_count;
  const total = docStats.total;
  const chunksWithTopic = chunkStats?.chunks_with_topic ?? 0;
  const totalChunks = chunkStats?.total_chunks ?? 0;

  if (enriched === 0 && total > 0) {
    return {
      health: 'error',
      label: 'Enrichment',
      detail: `0/${total} enriched`,
    };
  }

  const allDocsEnriched = enriched >= total;
  const allChunksClassified = totalChunks > 0 && chunksWithTopic >= totalChunks;

  if (allDocsEnriched && allChunksClassified) {
    return {
      health: 'complete',
      label: 'Enrichment',
      detail: `${enriched}/${total} enriched, ${chunksWithTopic} classified`,
    };
  }

  const parts: string[] = [`${enriched}/${total} enriched`];
  if (totalChunks > 0) {
    parts.push(`${chunksWithTopic}/${totalChunks} classified`);
  }

  return { health: 'partial', label: 'Enrichment', detail: parts.join(', ') };
}

export function computeChunkPhaseHealth(
  stats: ChunkStats | null
): PipelinePhaseState {
  if (!stats || stats.total_chunks === 0) {
    return { health: 'empty', label: 'Chunks', detail: 'No chunks' };
  }

  const withEmbedding = stats.chunks_with_embedding;
  const total = stats.total_chunks;

  if (withEmbedding < total) {
    return {
      health: 'partial',
      label: 'Chunks',
      detail: `${withEmbedding}/${total} embedded`,
    };
  }

  return {
    health: 'complete',
    label: 'Chunks',
    detail: `${total} chunks`,
  };
}

export function computeStagingPhaseHealth(
  statusCounts: StagingStatusCounts | null
): PipelinePhaseState {
  if (!statusCounts || statusCounts.total === 0) {
    return { health: 'empty', label: 'Staging', detail: 'No staging data' };
  }

  const { pending, review, approved, rejected, imported, total } = statusCounts;

  if (imported === total) {
    return {
      health: 'complete',
      label: 'Staging',
      detail: `${imported} imported`,
    };
  }

  if (rejected > 0) {
    return {
      health: 'error',
      label: 'Staging',
      detail: `${rejected} rejected, ${approved} approved`,
    };
  }

  const parts: string[] = [];
  if (pending > 0) parts.push(`${pending} pending`);
  if (review > 0) parts.push(`${review} in review`);
  if (approved > 0) parts.push(`${approved} approved`);

  return { health: 'partial', label: 'Staging', detail: parts.join(', ') };
}

export function computeProductionPhaseHealth(
  components: ProductionComponent[]
): PipelinePhaseState {
  if (components.length === 0) {
    return { health: 'empty', label: 'Production', detail: 'No production data' };
  }

  const themes = components.reduce((sum, c) => sum + c.themes.length, 0);
  const topics = components.reduce(
    (sum, c) => sum + c.themes.reduce((ts, t) => ts + t.topics.length, 0),
    0
  );

  const health: PhaseHealth = topics > 0 ? 'complete' : 'partial';

  return {
    health,
    label: 'Production',
    detail: `${components.length}/${themes}/${topics}`,
  };
}
