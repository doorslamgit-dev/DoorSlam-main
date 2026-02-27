// src/services/curriculumAdminService.ts
// Service layer for curriculum admin operations.

import { supabase } from '@/lib/supabase';
import type {
  NormalizationResult,
  ProductionComponent,
  StagingHierarchy,
  StagingRow,
  StagingStatus,
  StagingStatusCounts,
  SubjectOption,
} from '@/types/curriculumAdmin';

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function fetchSubjectsForAdmin(): Promise<{
  data: SubjectOption[] | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('subjects')
    .select('id, subject_name, spec_code, color, exam_boards!inner(name)')
    .order('subject_name');

  if (error) return { data: null, error: error.message };

  const mapped = (data ?? []).map((row: Record<string, unknown>) => {
    const board = row.exam_boards as { name: string } | null;
    return {
      id: row.id as string,
      subject_name: row.subject_name as string,
      spec_code: (row.spec_code as string) ?? null,
      exam_board_name: board?.name ?? 'Unknown',
      color: (row.color as string) ?? '#6366f1',
    };
  });

  return { data: mapped, error: null };
}

export async function fetchStagingData(subjectId: string): Promise<{
  data: StagingRow[] | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('curriculum_staging')
    .select('*')
    .eq('subject_id', subjectId)
    .order('component_order')
    .order('theme_order')
    .order('topic_order');

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as StagingRow[], error: null };
}

export async function fetchProductionHierarchy(subjectId: string): Promise<{
  data: ProductionComponent[] | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('components')
    .select(`
      id, component_name, component_weighting, order_index,
      themes (
        id, theme_name, order_index,
        topics (
          id, topic_name, order_index, canonical_code
        )
      )
    `)
    .eq('subject_id', subjectId)
    .order('order_index');

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as ProductionComponent[], error: null };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function bulkApproveStaging(subjectId: string): Promise<{
  error: string | null;
}> {
  const { error } = await supabase
    .from('curriculum_staging')
    .update({ status: 'approved' })
    .eq('subject_id', subjectId)
    .in('status', ['pending', 'review']);

  return { error: error?.message ?? null };
}

export async function updateStagingStatus(
  rowIds: number[],
  newStatus: StagingStatus
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('curriculum_staging')
    .update({ status: newStatus })
    .in('id', rowIds);

  return { error: error?.message ?? null };
}

export async function normalizeStaging(subjectId: string): Promise<{
  data: NormalizationResult | null;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc('rpc_normalize_curriculum_staging', {
    p_subject_id: subjectId,
  });

  if (error) return { data: null, error: error.message };
  return { data: data as NormalizationResult, error: null };
}

export async function deleteStagingBatch(batchId: string): Promise<{
  error: string | null;
}> {
  const { error } = await supabase
    .from('curriculum_staging')
    .delete()
    .eq('extraction_batch_id', batchId);

  return { error: error?.message ?? null };
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

export function groupStagingIntoHierarchy(rows: StagingRow[]): StagingHierarchy {
  const componentMap = new Map<string, {
    name: string;
    order: number;
    weighting: string | null;
    themeMap: Map<string, { name: string; order: number; topics: StagingRow[] }>;
  }>();

  for (const row of rows) {
    let comp = componentMap.get(row.component_name);
    if (!comp) {
      comp = {
        name: row.component_name,
        order: row.component_order,
        weighting: row.component_weighting,
        themeMap: new Map(),
      };
      componentMap.set(row.component_name, comp);
    }

    let theme = comp.themeMap.get(row.theme_name);
    if (!theme) {
      theme = { name: row.theme_name, order: row.theme_order, topics: [] };
      comp.themeMap.set(row.theme_name, theme);
    }

    theme.topics.push(row);
  }

  const components = Array.from(componentMap.values())
    .sort((a, b) => a.order - b.order)
    .map((comp) => ({
      name: comp.name,
      order: comp.order,
      weighting: comp.weighting,
      themes: Array.from(comp.themeMap.values())
        .sort((a, b) => a.order - b.order)
        .map((theme) => ({
          name: theme.name,
          order: theme.order,
          topics: theme.topics.sort((a, b) => a.topic_order - b.topic_order),
        })),
    }));

  return { components };
}

export function computeStatusCounts(rows: StagingRow[]): StagingStatusCounts {
  const counts: StagingStatusCounts = {
    pending: 0,
    review: 0,
    approved: 0,
    rejected: 0,
    imported: 0,
    total: rows.length,
  };

  for (const row of rows) {
    if (row.status in counts) {
      counts[row.status as keyof Omit<StagingStatusCounts, 'total'>]++;
    }
  }

  return counts;
}
