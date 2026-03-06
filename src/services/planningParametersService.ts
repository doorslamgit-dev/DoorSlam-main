// src/services/planningParametersService.ts
// Service for fetching, caching, and updating planning parameters
// These replace hardcoded constants in coverageService.ts and sessionCalculator.ts

import { supabase } from '../lib/supabase';

/* ============================
   Types
============================ */

export interface PlanningParameter {
  value: number;
  category: string;
  label: string;
  description: string | null;
  min_value: number | null;
  max_value: number | null;
}

export type PlanningParametersMap = Record<string, PlanningParameter>;

/* ============================
   Cache
============================ */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cachedParams: PlanningParametersMap | null = null;
let cacheTimestamp = 0;

function isCacheValid(): boolean {
  return cachedParams !== null && Date.now() - cacheTimestamp < CACHE_TTL_MS;
}

/* ============================
   Hardcoded defaults (fallback if RPC unavailable)
============================ */

const DEFAULTS: Record<string, number> = {
  'coverage.target_slots_per_topic': 1.5,
  'coverage.default_topics_per_subject': 50,
  'coverage.contingency_percent': 10,
  'goals.pass_exam': 1.0,
  'goals.improve_grade': 1.15,
  'goals.excel': 1.3,
  'needs.memory_addition': 0.2,
  'needs.attention_addition': 0.1,
  'grades.gap_multiplier_per_point': 0.1,
  'priority.high_weight': 1.0,
  'priority.medium_weight': 0.85,
  'priority.low_weight': 0.7,
  'priority.high_threshold': 2,
  'priority.medium_threshold': 5,
  'session.attention_recommended_pattern': 20,
};

/* ============================
   Fetch
============================ */

export async function fetchPlanningParameters(): Promise<PlanningParametersMap> {
  if (isCacheValid()) return cachedParams!;

  const { data, error } = await supabase.rpc('rpc_get_planning_parameters');

  if (error) {
    console.error('Failed to fetch planning parameters:', error);
    // Return defaults wrapped as PlanningParameter objects
    return buildDefaultMap();
  }

  if (!data || typeof data !== 'object') {
    return buildDefaultMap();
  }

  cachedParams = data as PlanningParametersMap;
  cacheTimestamp = Date.now();
  return cachedParams;
}

function buildDefaultMap(): PlanningParametersMap {
  const map: PlanningParametersMap = {};
  for (const [key, value] of Object.entries(DEFAULTS)) {
    map[key] = {
      value,
      category: key.split('.')[0],
      label: key,
      description: null,
      min_value: null,
      max_value: null,
    };
  }
  return map;
}

/* ============================
   Sync getters (use cached or defaults)
============================ */

export function getParam(key: string): number {
  if (cachedParams && key in cachedParams) {
    return cachedParams[key].value;
  }
  return DEFAULTS[key] ?? 1.0;
}

export function getGoalMultiplier(goalCode: string | undefined): number {
  if (!goalCode) return 1.0;
  return getParam(`goals.${goalCode}`);
}

export function getNeedsMultiplier(needCodes: string[]): number {
  const MEMORY_CODES = ['REMEMBERING_FACTS', 'MEMORY_DIFFICULTIES'];
  const ATTENTION_CODES = ['ADHD_TRAITS', 'ATTENTION_FOCUS'];

  let multiplier = 1.0;

  if (needCodes.some((c) => MEMORY_CODES.includes(c))) {
    multiplier += getParam('needs.memory_addition');
  }

  if (needCodes.some((c) => ATTENTION_CODES.includes(c))) {
    multiplier += getParam('needs.attention_addition');
  }

  return multiplier;
}

export function getPriorityWeight(sortOrder: number): number {
  const highThreshold = getParam('priority.high_threshold');
  const mediumThreshold = getParam('priority.medium_threshold');

  if (sortOrder <= highThreshold) return getParam('priority.high_weight');
  if (sortOrder <= mediumThreshold) return getParam('priority.medium_weight');
  return getParam('priority.low_weight');
}

export function getEffortMultiplier(
  currentGrade: number | null,
  targetGrade: number | null
): number {
  const gradeGap = Math.max(0, (targetGrade ?? 5) - (currentGrade ?? 5));
  return 1.0 + gradeGap * getParam('grades.gap_multiplier_per_point');
}

/* ============================
   Admin: update a parameter
============================ */

export async function updateParameter(
  key: string,
  value: number
): Promise<{ success: boolean; error: string | null }> {
  const { data, error } = await supabase.rpc('rpc_update_planning_parameter', {
    p_key: key,
    p_value: value,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Invalidate cache so next read picks up the change
  cachedParams = null;
  cacheTimestamp = 0;

  const result = data as { success?: boolean } | null;
  return { success: result?.success ?? true, error: null };
}

/** Force cache invalidation (e.g. after admin changes) */
export function invalidateCache(): void {
  cachedParams = null;
  cacheTimestamp = 0;
}
