// src/services/__tests__/curriculumAdminService.test.ts
// Tests for pure helper functions in curriculumAdminService.

import { describe, it, expect } from 'vitest';
import {
  groupStagingIntoHierarchy,
  computeStatusCounts,
} from '@/services/curriculumAdminService';
import type { StagingRow } from '@/types/curriculumAdmin';

// ---------------------------------------------------------------------------
// Test data factory
// ---------------------------------------------------------------------------

function makeStagingRow(overrides: Partial<StagingRow> = {}): StagingRow {
  return {
    id: 1,
    subject_id: 'subj-1',
    component_name: 'Component 1',
    component_order: 1,
    component_weighting: '50%',
    theme_name: 'Theme 1',
    theme_order: 1,
    topic_name: 'Topic 1',
    topic_order: 1,
    canonical_code: 'C1.T1.1',
    extraction_batch_id: 'batch-1',
    status: 'pending',
    created_at: '2026-02-27T12:00:00Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// groupStagingIntoHierarchy
// ---------------------------------------------------------------------------

describe('groupStagingIntoHierarchy', () => {
  it('returns empty components for empty input', () => {
    const result = groupStagingIntoHierarchy([]);
    expect(result.components).toEqual([]);
  });

  it('groups a single row into component > theme > topic', () => {
    const row = makeStagingRow();
    const result = groupStagingIntoHierarchy([row]);

    expect(result.components).toHaveLength(1);
    expect(result.components[0].name).toBe('Component 1');
    expect(result.components[0].order).toBe(1);
    expect(result.components[0].weighting).toBe('50%');
    expect(result.components[0].themes).toHaveLength(1);
    expect(result.components[0].themes[0].name).toBe('Theme 1');
    expect(result.components[0].themes[0].topics).toHaveLength(1);
    expect(result.components[0].themes[0].topics[0].topic_name).toBe('Topic 1');
  });

  it('groups multiple rows into correct hierarchy', () => {
    const rows: StagingRow[] = [
      makeStagingRow({ id: 1, component_name: 'Biology', component_order: 1, theme_name: 'Cells', theme_order: 1, topic_name: 'Cell structure', topic_order: 1 }),
      makeStagingRow({ id: 2, component_name: 'Biology', component_order: 1, theme_name: 'Cells', theme_order: 1, topic_name: 'Cell division', topic_order: 2 }),
      makeStagingRow({ id: 3, component_name: 'Biology', component_order: 1, theme_name: 'Organisation', theme_order: 2, topic_name: 'Tissues', topic_order: 1 }),
      makeStagingRow({ id: 4, component_name: 'Chemistry', component_order: 2, theme_name: 'Atomic structure', theme_order: 1, topic_name: 'Atoms', topic_order: 1 }),
    ];

    const result = groupStagingIntoHierarchy(rows);

    expect(result.components).toHaveLength(2);
    expect(result.components[0].name).toBe('Biology');
    expect(result.components[1].name).toBe('Chemistry');

    // Biology has 2 themes
    expect(result.components[0].themes).toHaveLength(2);
    expect(result.components[0].themes[0].name).toBe('Cells');
    expect(result.components[0].themes[1].name).toBe('Organisation');

    // Cells has 2 topics
    expect(result.components[0].themes[0].topics).toHaveLength(2);
    expect(result.components[0].themes[0].topics[0].topic_name).toBe('Cell structure');
    expect(result.components[0].themes[0].topics[1].topic_name).toBe('Cell division');

    // Chemistry has 1 theme with 1 topic
    expect(result.components[1].themes).toHaveLength(1);
    expect(result.components[1].themes[0].topics).toHaveLength(1);
  });

  it('sorts components by order', () => {
    const rows: StagingRow[] = [
      makeStagingRow({ id: 1, component_name: 'Second', component_order: 2, theme_name: 'T1', theme_order: 1, topic_name: 'Topic A', topic_order: 1 }),
      makeStagingRow({ id: 2, component_name: 'First', component_order: 1, theme_name: 'T1', theme_order: 1, topic_name: 'Topic B', topic_order: 1 }),
    ];

    const result = groupStagingIntoHierarchy(rows);

    expect(result.components[0].name).toBe('First');
    expect(result.components[1].name).toBe('Second');
  });

  it('sorts themes within a component by order', () => {
    const rows: StagingRow[] = [
      makeStagingRow({ id: 1, component_name: 'C1', component_order: 1, theme_name: 'Theme B', theme_order: 2, topic_name: 'Topic 1', topic_order: 1 }),
      makeStagingRow({ id: 2, component_name: 'C1', component_order: 1, theme_name: 'Theme A', theme_order: 1, topic_name: 'Topic 2', topic_order: 1 }),
    ];

    const result = groupStagingIntoHierarchy(rows);

    expect(result.components[0].themes[0].name).toBe('Theme A');
    expect(result.components[0].themes[1].name).toBe('Theme B');
  });

  it('sorts topics within a theme by topic_order', () => {
    const rows: StagingRow[] = [
      makeStagingRow({ id: 1, topic_name: 'Third', topic_order: 3 }),
      makeStagingRow({ id: 2, topic_name: 'First', topic_order: 1 }),
      makeStagingRow({ id: 3, topic_name: 'Second', topic_order: 2 }),
    ];

    const result = groupStagingIntoHierarchy(rows);
    const topics = result.components[0].themes[0].topics;

    expect(topics[0].topic_name).toBe('First');
    expect(topics[1].topic_name).toBe('Second');
    expect(topics[2].topic_name).toBe('Third');
  });

  it('preserves component weighting (including null)', () => {
    const rows: StagingRow[] = [
      makeStagingRow({ id: 1, component_name: 'With Weight', component_weighting: '60%' }),
      makeStagingRow({ id: 2, component_name: 'No Weight', component_weighting: null, component_order: 2 }),
    ];

    const result = groupStagingIntoHierarchy(rows);

    expect(result.components[0].weighting).toBe('60%');
    expect(result.components[1].weighting).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// computeStatusCounts
// ---------------------------------------------------------------------------

describe('computeStatusCounts', () => {
  it('returns all zeros for empty input', () => {
    const result = computeStatusCounts([]);
    expect(result).toEqual({
      pending: 0,
      review: 0,
      approved: 0,
      rejected: 0,
      imported: 0,
      total: 0,
    });
  });

  it('counts rows by status correctly', () => {
    const rows: StagingRow[] = [
      makeStagingRow({ id: 1, status: 'pending' }),
      makeStagingRow({ id: 2, status: 'pending' }),
      makeStagingRow({ id: 3, status: 'review' }),
      makeStagingRow({ id: 4, status: 'approved' }),
      makeStagingRow({ id: 5, status: 'approved' }),
      makeStagingRow({ id: 6, status: 'approved' }),
      makeStagingRow({ id: 7, status: 'rejected' }),
      makeStagingRow({ id: 8, status: 'imported' }),
    ];

    const result = computeStatusCounts(rows);

    expect(result.pending).toBe(2);
    expect(result.review).toBe(1);
    expect(result.approved).toBe(3);
    expect(result.rejected).toBe(1);
    expect(result.imported).toBe(1);
    expect(result.total).toBe(8);
  });

  it('sets total to row count regardless of status', () => {
    const rows: StagingRow[] = [
      makeStagingRow({ id: 1, status: 'pending' }),
      makeStagingRow({ id: 2, status: 'pending' }),
    ];

    const result = computeStatusCounts(rows);
    expect(result.total).toBe(2);
  });

  it('handles single status correctly', () => {
    const rows: StagingRow[] = [
      makeStagingRow({ id: 1, status: 'imported' }),
      makeStagingRow({ id: 2, status: 'imported' }),
      makeStagingRow({ id: 3, status: 'imported' }),
    ];

    const result = computeStatusCounts(rows);
    expect(result.imported).toBe(3);
    expect(result.pending).toBe(0);
    expect(result.total).toBe(3);
  });
});
