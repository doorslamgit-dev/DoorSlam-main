// src/services/contentGenerationService.ts
// Service layer for content generation admin operations.
// Queries content_units_staging, content_generation_jobs, and content_units tables.

import { supabase } from '@/lib/supabase';
import type {
  ContentStatsResponse,
  ContentType,
  GenerateContentResponse,
  ReviewAction,
  ReviewResponse,
  StagingItem,
  StagingItemUpdate,
  StagingStatus,
  TopicCoverage,
} from '@/types/contentGeneration';
import type { SubjectOption } from '@/types/curriculumAdmin';

// ---------------------------------------------------------------------------
// Subjects (reuse from curriculum admin)
// ---------------------------------------------------------------------------

export async function fetchSubjects(): Promise<{
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

// ---------------------------------------------------------------------------
// Content Generation (Edge Function)
// ---------------------------------------------------------------------------

export async function generateContent(
  subjectId: string,
  topicIds?: string[]
): Promise<{ data: GenerateContentResponse | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke('content-generate', {
    body: { subject_id: subjectId, topic_ids: topicIds },
  });

  if (error) {
    return { data: null, error: error.message || 'Content generation failed' };
  }

  return { data: data as GenerateContentResponse, error: null };
}

// ---------------------------------------------------------------------------
// Staging CRUD
// ---------------------------------------------------------------------------

export async function fetchStagingItems(filters: {
  subjectId: string;
  topicId?: string;
  status?: StagingStatus;
  contentType?: ContentType;
  limit?: number;
  offset?: number;
}): Promise<{
  data: StagingItem[] | null;
  total: number;
  error: string | null;
}> {
  let query = supabase
    .from('content_units_staging')
    .select('*', { count: 'exact' })
    .eq('subject_id', filters.subjectId)
    .order('created_at', { ascending: false });

  if (filters.topicId) query = query.eq('topic_id', filters.topicId);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.contentType) query = query.eq('content_type', filters.contentType);

  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) return { data: null, total: 0, error: error.message };
  return { data: (data ?? []) as StagingItem[], total: count ?? 0, error: null };
}

export async function updateStagingItem(
  id: string,
  update: StagingItemUpdate
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('content_units_staging')
    .update(update)
    .eq('id', id);

  return { error: error?.message ?? null };
}

// ---------------------------------------------------------------------------
// Review
// ---------------------------------------------------------------------------

export async function reviewStagingItems(
  actions: ReviewAction[]
): Promise<{ data: ReviewResponse | null; error: string | null }> {
  let approved = 0;
  let rejected = 0;

  for (const action of actions) {
    const newStatus = action.action === 'approve' ? 'approved' : 'rejected';
    const updateData: Record<string, unknown> = {
      status: newStatus,
      reviewed_at: new Date().toISOString(),
    };
    if (action.reviewer_notes) {
      updateData.reviewer_notes = action.reviewer_notes;
    }

    const { error } = await supabase
      .from('content_units_staging')
      .update(updateData)
      .eq('id', action.id);

    if (!error) {
      if (newStatus === 'approved') approved++;
      else rejected++;
    }
  }

  return { data: { approved, rejected }, error: null };
}

// ---------------------------------------------------------------------------
// Promote
// ---------------------------------------------------------------------------

export async function promoteApproved(subjectId?: string): Promise<{
  data: { promoted_count: number } | null;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc('rpc_promote_content_staging', {
    p_subject_id: subjectId ?? null,
  });

  if (error) return { data: null, error: error.message };
  return { data: data as { promoted_count: number }, error: null };
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export async function fetchContentStats(subjectId: string): Promise<{
  data: ContentStatsResponse | null;
  error: string | null;
}> {
  const { data: prodData, error: prodError } = await supabase
    .from('content_units')
    .select('content_type')
    .eq('subject_id', subjectId)
    .eq('status', 'active');

  if (prodError) return { data: null, error: prodError.message };

  const production: Record<string, number> = {};
  let prodTotal = 0;
  for (const row of prodData ?? []) {
    const ct = (row as Record<string, unknown>).content_type as string;
    production[ct] = (production[ct] ?? 0) + 1;
    prodTotal++;
  }
  production.total = prodTotal;

  const { data: stagingData, error: stagingError } = await supabase
    .from('content_units_staging')
    .select('status')
    .eq('subject_id', subjectId);

  if (stagingError) return { data: null, error: stagingError.message };

  const staging: Record<string, number> = {};
  let stagingTotal = 0;
  for (const row of stagingData ?? []) {
    const st = (row as Record<string, unknown>).status as string;
    staging[st] = (staging[st] ?? 0) + 1;
    stagingTotal++;
  }
  staging.total = stagingTotal;

  return {
    data: { subject_id: subjectId, production, staging },
    error: null,
  };
}

// ---------------------------------------------------------------------------
// Coverage (taxonomy with content counts)
// ---------------------------------------------------------------------------

export async function fetchTopicCoverage(subjectId: string): Promise<{
  data: TopicCoverage[] | null;
  error: string | null;
}> {
  const { data: components, error: compError } = await supabase
    .from('components')
    .select(`
      id, component_name,
      themes (
        id, theme_name,
        topics (id, topic_name, canonical_code)
      )
    `)
    .eq('subject_id', subjectId)
    .order('order_index');

  if (compError) return { data: null, error: compError.message };

  const { data: prodData } = await supabase
    .from('content_units')
    .select('topic_id, content_type')
    .eq('subject_id', subjectId)
    .eq('status', 'active');

  const prodCounts = new Map<string, Map<string, number>>();
  for (const row of prodData ?? []) {
    const r = row as Record<string, unknown>;
    const tid = r.topic_id as string;
    const ct = r.content_type as string;
    if (!prodCounts.has(tid)) prodCounts.set(tid, new Map());
    const m = prodCounts.get(tid)!;
    m.set(ct, (m.get(ct) ?? 0) + 1);
  }

  const { data: stagingData } = await supabase
    .from('content_units_staging')
    .select('topic_id')
    .eq('subject_id', subjectId)
    .in('status', ['pending_review', 'approved']);

  const stagingCounts = new Map<string, number>();
  for (const row of stagingData ?? []) {
    const tid = (row as Record<string, unknown>).topic_id as string;
    stagingCounts.set(tid, (stagingCounts.get(tid) ?? 0) + 1);
  }

  const topics: TopicCoverage[] = [];
  for (const comp of components ?? []) {
    const c = comp as Record<string, unknown>;
    for (const theme of (c.themes as Record<string, unknown>[]) ?? []) {
      for (const topic of (theme.topics as Record<string, unknown>[]) ?? []) {
        const tid = topic.id as string;
        const tc = prodCounts.get(tid);
        const fc = tc?.get('flashcard') ?? 0;
        const ts = tc?.get('teaching_slide') ?? 0;
        const we = tc?.get('worked_example') ?? 0;
        const pq = tc?.get('practice_question') ?? 0;
        topics.push({
          topic_id: tid,
          topic_name: topic.topic_name as string,
          canonical_code: (topic.canonical_code as string) ?? null,
          flashcard_count: fc,
          teaching_slide_count: ts,
          worked_example_count: we,
          practice_question_count: pq,
          total: fc + ts + we + pq,
          staging_count: stagingCounts.get(tid) ?? 0,
        });
      }
    }
  }

  return { data: topics, error: null };
}
