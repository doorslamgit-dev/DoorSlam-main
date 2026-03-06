// src/services/deleteSubjectService.ts
// Service for removing subjects from a child's revision plan

import { supabase } from '../lib/supabase';
import {
  isDeletionImpactAssessment,
  isDeleteSubjectsResult,
} from '../utils/typeGuards';

/* ============================
   Types
============================ */

export interface SubjectWithTopics {
  subject_id: string;
  subject_name: string;
  topic_count: number;
}

export interface DeletionImpactAssessment {
  child_id: string;
  current_weekly_sessions: number;
  weeks_in_plan: number;
  remaining_subjects: SubjectWithTopics[];
  remaining_subject_count: number;
  remaining_topic_count: number;
  removing_subjects: SubjectWithTopics[];
  removing_subject_count: number;
  removing_topic_count: number;
  future_sessions_to_delete: number;
  completed_sessions_preserved: number;
  current_coverage_percent: number;
  new_coverage_percent: number;
  current_sessions_per_topic: number;
  new_sessions_per_topic: number;
  recommendation: 'coverage_improves' | 'excess_capacity' | 'no_change' | 'no_subjects_remain';
  recommendation_detail: string;
  excess_sessions_per_week: number;
}

export interface DeleteSubjectsResult {
  success: boolean;
  child_id?: string;
  removed_count?: number;
  removed_subjects?: Array<{ subject_id: string; subject_name: string }>;
  sessions_deleted?: number;
  sessions_preserved?: number;
  message?: string;
  error?: string;
}

/* ============================
   Service Functions
============================ */

/**
 * Preview the impact of removing subjects before executing
 */
export async function getDeletionImpactAssessment(
  childId: string,
  subjectIds: string[]
): Promise<{ data: DeletionImpactAssessment | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc('rpc_get_deletion_impact_assessment', {
      p_child_id: childId,
      p_subject_ids: subjectIds,
    });

    if (error) {
      console.error('Error fetching deletion impact:', error);
      return { data: null, error: error.message };
    }

    if (!isDeletionImpactAssessment(data)) {
      return { data: null, error: 'Invalid deletion impact data received from API' };
    }

    return { data, error: null };
  } catch (err: unknown) {
    console.error('Exception fetching deletion impact:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to get deletion impact',
    };
  }
}

/**
 * Execute subject removal from a child's plan
 */
export async function removeSubjectsFromChild(
  childId: string,
  subjectIds: string[]
): Promise<DeleteSubjectsResult> {
  try {
    const { data, error } = await supabase.rpc('rpc_remove_subjects_from_child', {
      p_child_id: childId,
      p_subject_ids: subjectIds,
    });

    if (error) {
      console.error('Error removing subjects:', error);
      return { success: false, error: error.message };
    }

    if (!isDeleteSubjectsResult(data)) {
      return { success: false, error: 'Invalid response from API' };
    }

    return data;
  } catch (err: unknown) {
    console.error('Exception removing subjects:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to remove subjects',
    };
  }
}
