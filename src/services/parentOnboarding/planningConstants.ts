// src/services/parentOnboarding/planningConstants.ts
// Shared planning constants — single import point for coverageService and sessionCalculator.
// Delegates to planningParametersService (DB-backed, cached) so both calculators stay in sync.

import {
  getParam,
  getGoalMultiplier as _getGoalMultiplier,
  getNeedsMultiplier as _getNeedsMultiplier,
  getPriorityWeight as _getPriorityWeight,
  getEffortMultiplier as _getEffortMultiplier,
} from '../planningParametersService';
import type { NeedClusterSelection } from '../../components/parentOnboarding/steps/NeedsStep';

export type PriorityTier = 'high' | 'medium' | 'low';

/* ============================
   Coverage
============================ */

export function getTargetSlotsPerTopic(): number {
  return getParam('coverage.target_slots_per_topic');
}

export function getDefaultTopicsPerSubject(): number {
  return getParam('coverage.default_topics_per_subject');
}

export function getContingencyPercent(): number {
  return getParam('coverage.contingency_percent');
}

export const MAX_REALISTIC_SESSIONS_PER_DAY = 4;

/* ============================
   Goals
============================ */

export function getGoalMultiplier(goalCode: string | undefined): number {
  return _getGoalMultiplier(goalCode);
}

/* ============================
   Needs
============================ */

const MEMORY_NEED_CODES = ['REMEMBERING_FACTS', 'MEMORY_DIFFICULTIES'];
const ATTENTION_NEED_CODES = ['ADHD_TRAITS', 'ATTENTION_FOCUS'];

export function getNeedsFactors(needClusters: NeedClusterSelection[]): {
  multiplier: number;
  pattern: 'p20' | 'p45' | 'p70';
  advice: string | null;
} {
  const codes = needClusters.map((nc) => nc.cluster_code);
  const multiplier = _getNeedsMultiplier(codes);

  let pattern: 'p20' | 'p45' | 'p70' = 'p45';
  let advice: string | null = null;

  if (codes.some((c) => ATTENTION_NEED_CODES.includes(c))) {
    pattern = 'p20';
    advice =
      'Based on the learning needs you selected, we recommend shorter 20-minute sessions for better focus and retention.';
  }

  return { multiplier, pattern, advice };
}

/* ============================
   Priority
============================ */

export function getPriorityTier(sortOrder: number): PriorityTier {
  const highThreshold = getParam('priority.high_threshold');
  const mediumThreshold = getParam('priority.medium_threshold');
  if (sortOrder <= highThreshold) return 'high';
  if (sortOrder <= mediumThreshold) return 'medium';
  return 'low';
}

export function getPriorityWeight(sortOrder: number): number {
  return _getPriorityWeight(sortOrder);
}

/* ============================
   Grade effort
============================ */

export function getEffortMultiplier(
  currentGrade: number | null,
  targetGrade: number | null
): number {
  return _getEffortMultiplier(currentGrade, targetGrade);
}

/* ============================
   Re-exports for convenience
============================ */

export { MEMORY_NEED_CODES, ATTENTION_NEED_CODES };
