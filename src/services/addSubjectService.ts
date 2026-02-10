// src/services/addSubjectService.ts
// Service for adding subjects to an existing child
// FEAT-012: Updated with impact assessment and redistribution

import { supabase } from "../lib/supabase";
import {
  isAddSubjectsResult,
  isImpactAssessment,
  isSubjectForPrioritizationArray,
} from "../utils/typeGuards";

export interface SubjectToAdd {
  subject_id: string;
  subject_name: string;
  exam_board_name?: string;
  current_grade: string | null;
  target_grade: string | null;
  grade_confidence: "confirmed" | "estimated";
}

export interface PathwaySelection {
  subject_id: string;
  pathway_id: string;
}

export interface SubjectPriority {
  subject_id: string;
  sort_order: number;
}

export interface AddSubjectsResult {
  success: boolean;
  child_id?: string;
  added_count?: number;
  skipped_count?: number;
  added_subjects?: Array<{
    subject_id: string;
    subject_name: string;
    child_subject_id: string;
  }>;
  skipped_subjects?: Array<{
    subject_id: string;
    subject_name: string;
    reason: string;
  }>;
  redistribution?: {
    success: boolean;
    sessions_redistributed: number;
    subject_allocations: Record<string, { target: number; allocated: number }>;
  };
  impact_assessment?: ImpactAssessment;
  message?: string;
  error?: string;
}

export interface AvailableSubject {
  subject_id: string;
  subject_name: string;
  subject_code: string;
  exam_type_id: string;
  exam_type_name: string;
  exam_board_id: string;
  exam_board_name: string;
  icon: string;
  color: string;
  requires_pathway: boolean;
}

export interface ChildExamType {
  exam_type_id: string;
  exam_type_name: string;
  exam_type_code: string;
  subject_count: number;
}

// FEAT-012: Impact assessment types
export interface ImpactAssessment {
  child_id: string;
  current_weekly_sessions: number;
  weeks_in_plan: number;
  total_available_sessions: number;
  existing_subjects: SubjectWithTopics[];
  existing_subject_count: number;
  existing_topic_count: number;
  new_subjects: SubjectWithTopics[];
  new_subject_count: number;
  new_topic_count: number;
  total_topics: number;
  sessions_per_topic: number;
  coverage_percent: number;
  recommendation: "on_track" | "tight_but_ok" | "add_sessions" | "prioritize";
  recommendation_detail: string;
  additional_sessions_needed: number;
}

export interface SubjectWithTopics {
  subject_id: string;
  subject_name: string;
  exam_board_name?: string;
  sort_order?: number;
  current_grade?: string;
  target_grade?: string;
  grade_gap?: number;
  topic_count: number;
  icon: string;
  color: string;
  is_new?: boolean;
}

export interface SubjectForPrioritization {
  subject_id: string;
  subject_name: string;
  exam_board_name: string;
  sort_order: number;
  current_grade: string | null;
  target_grade: string | null;
  grade_confidence: string;
  grade_gap: number;
  topic_count: number;
  topics_covered: number;
  icon: string;
  color: string;
}

/**
 * Add subjects to an existing child with full redistribution
 * FEAT-012: Now accepts priorities and triggers redistribution
 */
export async function addSubjectsToChild(
  childId: string,
  subjects: SubjectToAdd[],
  pathwaySelections: PathwaySelection[] = [],
  allPriorities: SubjectPriority[] = []
): Promise<AddSubjectsResult> {
  try {
    const { data, error } = await supabase.rpc("rpc_add_subjects_to_existing_child", {
      p_child_id: childId,
      p_subjects: subjects.map((s) => ({
        subject_id: s.subject_id,
        subject_name: s.subject_name,
        current_grade: s.current_grade,
        target_grade: s.target_grade,
        grade_confidence: s.grade_confidence,
      })),
      p_pathway_selections: pathwaySelections.filter(
        (p) => p.pathway_id && p.pathway_id !== "skipped"
      ),
      p_all_priorities: allPriorities.length > 0 ? allPriorities : null,
    });

    if (error) {
      console.error("Error adding subjects:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    if (!isAddSubjectsResult(data)) {
      return {
        success: false,
        error: "Invalid add subjects response from API",
      };
    }

    return data;
  } catch (err: unknown) {
    console.error("Exception adding subjects:", err);
    return {
      success: false,
      error: (err instanceof Error ? err.message : "Failed to add subjects"),
    };
  }
}

/**
 * FEAT-012: Get impact assessment before adding subjects
 */
export async function getImpactAssessment(
  childId: string,
  newSubjectIds: string[]
): Promise<{ data: ImpactAssessment | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc("rpc_get_plan_impact_assessment", {
      p_child_id: childId,
      p_new_subject_ids: newSubjectIds,
    });

    if (error) {
      console.error("Error fetching impact assessment:", error);
      return { data: null, error: error.message };
    }

    if (!isImpactAssessment(data)) {
      return { data: null, error: "Invalid impact assessment data received from API" };
    }

    return { data, error: null };
  } catch (err: unknown) {
    console.error("Exception fetching impact assessment:", err);
    return { data: null, error: (err instanceof Error ? err.message : "Failed to get impact assessment") };
  }
}

/**
 * FEAT-012: Get all subjects for prioritization
 */
export async function getSubjectsForPrioritization(
  childId: string
): Promise<{ data: SubjectForPrioritization[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc("rpc_get_child_subjects_for_prioritization", {
      p_child_id: childId,
    });

    if (error) {
      console.error("Error fetching subjects for prioritization:", error);
      return { data: null, error: error.message };
    }

    if (!isSubjectForPrioritizationArray(data)) {
      return { data: null, error: "Invalid subjects for prioritization data received from API" };
    }

    return { data, error: null };
  } catch (err: unknown) {
    console.error("Exception fetching subjects:", err);
    return { data: null, error: (err instanceof Error ? err.message : "Failed to fetch subjects") };
  }
}

/**
 * FEAT-012: Update subject priorities
 */
export async function updateSubjectPriorities(
  childId: string,
  priorities: SubjectPriority[]
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc("rpc_update_subject_priorities", {
      p_child_id: childId,
      p_priorities: priorities,
    });

    if (error) {
      console.error("Error updating priorities:", error);
      return { success: false, error: error.message };
    }

    if (!data || typeof data !== 'object' || !('success' in data)) {
      return { success: false, error: "Invalid update priorities response from API" };
    }

    return { success: data.success ?? true, error: null };
  } catch (err: unknown) {
    console.error("Exception updating priorities:", err);
    return { success: false, error: (err instanceof Error ? err.message : "Failed to update priorities") };
  }
}

/**
 * Get subjects the child is NOT enrolled in
 */
export async function getAvailableSubjectsForChild(
  childId: string,
  examTypeIds?: string[]
): Promise<{ data: AvailableSubject[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc("rpc_get_available_subjects_for_child", {
      p_child_id: childId,
      p_exam_type_ids: examTypeIds || null,
    });

    if (error) {
      console.error("Error fetching available subjects:", error);
      return { data: null, error: error.message };
    }

    if (!Array.isArray(data)) {
      return { data: null, error: "Invalid available subjects data received from API" };
    }

    return { data: data as AvailableSubject[], error: null };
  } catch (err: unknown) {
    console.error("Exception fetching available subjects:", err);
    return { data: null, error: (err instanceof Error ? err.message : "Failed to fetch subjects") };
  }
}

/**
 * Get exam types the child currently has subjects in
 */
export async function getChildExamTypes(
  childId: string
): Promise<{ data: ChildExamType[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc("rpc_get_child_exam_types", {
      p_child_id: childId,
    });

    if (error) {
      console.error("Error fetching child exam types:", error);
      return { data: null, error: error.message };
    }

    if (!Array.isArray(data)) {
      return { data: null, error: "Invalid child exam types data received from API" };
    }

    return { data: data as ChildExamType[], error: null };
  } catch (err: unknown) {
    console.error("Exception fetching child exam types:", err);
    return { data: null, error: (err instanceof Error ? err.message : "Failed to fetch exam types") };
  }
}

/**
 * Get all available exam types (for selecting new ones)
 */
export async function getAllExamTypes(): Promise<{
  data: Array<{ id: string; name: string; code: string }> | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from("exam_types")
      .select("id, name, code")
      .order("name");

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err: unknown) {
    return { data: null, error: (err instanceof Error ? err.message : String(err)) };
  }
}