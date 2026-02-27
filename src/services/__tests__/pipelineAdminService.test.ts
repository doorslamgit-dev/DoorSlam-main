// src/services/__tests__/pipelineAdminService.test.ts
// Tests for pure helper functions in pipelineAdminService.

import { describe, it, expect } from 'vitest';
import {
  computeChunkPhaseHealth,
  computeDocumentPhaseHealth,
  computeEnrichmentPhaseHealth,
  computeProcessingPhaseHealth,
  computeProductionPhaseHealth,
  computeStagingPhaseHealth,
} from '@/services/pipelineAdminService';
import type { ChunkStats, DocumentStats } from '@/types/pipelineAdmin';
import type { ProductionComponent, StagingStatusCounts } from '@/types/curriculumAdmin';

// ---------------------------------------------------------------------------
// Test data factories
// ---------------------------------------------------------------------------

function makeDocStats(overrides: Partial<DocumentStats> = {}): DocumentStats {
  return {
    total: 10,
    by_status: { completed: 10 },
    by_doc_type: { qp: 4, ms: 4, er: 2 },
    by_year: { '2024': 5, '2023': 5 },
    enriched_count: 10,
    missing_summary_count: 0,
    ...overrides,
  };
}

function makeChunkStats(overrides: Partial<ChunkStats> = {}): ChunkStats {
  return {
    total_chunks: 100,
    chunks_with_embedding: 100,
    chunks_with_topic: 90,
    chunks_without_topic: 10,
    unique_topics_covered: 15,
    by_chunk_type: { question: 30, explanation: 40, general: 30 },
    by_document: [
      { document_id: 'd1', document_title: 'Doc 1', doc_type: 'qp', chunk_count: 50 },
      { document_id: 'd2', document_title: 'Doc 2', doc_type: 'ms', chunk_count: 50 },
    ],
    ...overrides,
  };
}

function makeStatusCounts(overrides: Partial<StagingStatusCounts> = {}): StagingStatusCounts {
  return {
    pending: 0,
    review: 0,
    approved: 0,
    rejected: 0,
    imported: 0,
    total: 0,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// computeDocumentPhaseHealth
// ---------------------------------------------------------------------------

describe('computeDocumentPhaseHealth', () => {
  it('returns empty for null stats', () => {
    expect(computeDocumentPhaseHealth(null).health).toBe('empty');
  });

  it('returns empty for zero documents', () => {
    expect(computeDocumentPhaseHealth(makeDocStats({ total: 0 })).health).toBe('empty');
  });

  it('returns complete when documents exist', () => {
    const result = computeDocumentPhaseHealth(makeDocStats());
    expect(result.health).toBe('complete');
    expect(result.detail).toContain('10 docs');
  });
});

// ---------------------------------------------------------------------------
// computeProcessingPhaseHealth
// ---------------------------------------------------------------------------

describe('computeProcessingPhaseHealth', () => {
  it('returns empty for null stats', () => {
    expect(computeProcessingPhaseHealth(null).health).toBe('empty');
  });

  it('returns complete when all completed', () => {
    const result = computeProcessingPhaseHealth(makeDocStats());
    expect(result.health).toBe('complete');
  });

  it('returns error when there are failed documents', () => {
    const stats = makeDocStats({ by_status: { completed: 8, failed: 2 } });
    const result = computeProcessingPhaseHealth(stats);
    expect(result.health).toBe('error');
    expect(result.detail).toContain('2 failed');
  });

  it('returns partial when there are pending documents', () => {
    const stats = makeDocStats({ by_status: { completed: 7, pending: 3 } });
    const result = computeProcessingPhaseHealth(stats);
    expect(result.health).toBe('partial');
    expect(result.detail).toContain('in progress');
  });
});

// ---------------------------------------------------------------------------
// computeEnrichmentPhaseHealth
// ---------------------------------------------------------------------------

describe('computeEnrichmentPhaseHealth', () => {
  it('returns empty when no documents', () => {
    expect(computeEnrichmentPhaseHealth(null, null).health).toBe('empty');
  });

  it('returns error when docs exist but none enriched', () => {
    const docStats = makeDocStats({ enriched_count: 0, missing_summary_count: 10 });
    const result = computeEnrichmentPhaseHealth(docStats, null);
    expect(result.health).toBe('error');
  });

  it('returns complete when all enriched and all chunks classified', () => {
    const docStats = makeDocStats({ enriched_count: 10 });
    const chunkStats = makeChunkStats({ chunks_with_topic: 100, chunks_without_topic: 0 });
    const result = computeEnrichmentPhaseHealth(docStats, chunkStats);
    expect(result.health).toBe('complete');
  });

  it('returns partial when some docs enriched', () => {
    const docStats = makeDocStats({ enriched_count: 5, missing_summary_count: 5 });
    const chunkStats = makeChunkStats({ chunks_with_topic: 50, chunks_without_topic: 50 });
    const result = computeEnrichmentPhaseHealth(docStats, chunkStats);
    expect(result.health).toBe('partial');
  });
});

// ---------------------------------------------------------------------------
// computeChunkPhaseHealth
// ---------------------------------------------------------------------------

describe('computeChunkPhaseHealth', () => {
  it('returns empty for null stats', () => {
    expect(computeChunkPhaseHealth(null).health).toBe('empty');
  });

  it('returns empty for zero chunks', () => {
    expect(
      computeChunkPhaseHealth(makeChunkStats({ total_chunks: 0, chunks_with_embedding: 0 })).health
    ).toBe('empty');
  });

  it('returns complete when all chunks have embeddings', () => {
    const result = computeChunkPhaseHealth(makeChunkStats());
    expect(result.health).toBe('complete');
    expect(result.detail).toContain('100 chunks');
  });

  it('returns partial when some chunks missing embeddings', () => {
    const stats = makeChunkStats({ total_chunks: 100, chunks_with_embedding: 80 });
    const result = computeChunkPhaseHealth(stats);
    expect(result.health).toBe('partial');
    expect(result.detail).toContain('80/100');
  });
});

// ---------------------------------------------------------------------------
// computeStagingPhaseHealth
// ---------------------------------------------------------------------------

describe('computeStagingPhaseHealth', () => {
  it('returns empty for null counts', () => {
    expect(computeStagingPhaseHealth(null).health).toBe('empty');
  });

  it('returns empty for zero total', () => {
    expect(computeStagingPhaseHealth(makeStatusCounts()).health).toBe('empty');
  });

  it('returns complete when all imported', () => {
    const counts = makeStatusCounts({ imported: 20, total: 20 });
    const result = computeStagingPhaseHealth(counts);
    expect(result.health).toBe('complete');
  });

  it('returns error when there are rejected rows', () => {
    const counts = makeStatusCounts({ approved: 10, rejected: 5, total: 15 });
    const result = computeStagingPhaseHealth(counts);
    expect(result.health).toBe('error');
  });

  it('returns partial when there are pending rows', () => {
    const counts = makeStatusCounts({ pending: 5, approved: 10, total: 15 });
    const result = computeStagingPhaseHealth(counts);
    expect(result.health).toBe('partial');
    expect(result.detail).toContain('5 pending');
  });
});

// ---------------------------------------------------------------------------
// computeProductionPhaseHealth
// ---------------------------------------------------------------------------

describe('computeProductionPhaseHealth', () => {
  it('returns empty for no components', () => {
    expect(computeProductionPhaseHealth([]).health).toBe('empty');
  });

  it('returns complete when components have topics', () => {
    const components: ProductionComponent[] = [
      {
        id: 'c1',
        component_name: 'Bio',
        component_weighting: null,
        order_index: 1,
        themes: [
          {
            id: 't1',
            theme_name: 'Cells',
            order_index: 1,
            topics: [{ id: 'tp1', topic_name: 'Cell structure', order_index: 1, canonical_code: null }],
          },
        ],
      },
    ];
    const result = computeProductionPhaseHealth(components);
    expect(result.health).toBe('complete');
    expect(result.detail).toBe('1/1/1');
  });

  it('returns partial when components exist but no topics', () => {
    const components: ProductionComponent[] = [
      {
        id: 'c1',
        component_name: 'Bio',
        component_weighting: null,
        order_index: 1,
        themes: [],
      },
    ];
    const result = computeProductionPhaseHealth(components);
    expect(result.health).toBe('partial');
  });
});
