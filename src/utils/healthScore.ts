// src/utils/healthScore.ts
// Pure utility for calculating a child's revision health score (0-100)

import type { SubjectCoverage } from '../types/parent/parentDashboardTypes';
import type { PlanCoverageOverview } from '../services/timetableService';

export type HealthRAG = 'on_track' | 'keep_an_eye' | 'needs_attention';

export interface HealthScoreResult {
  /** Overall health score 0-100 */
  score: number;
  /** RAG status derived from score */
  ragStatus: HealthRAG;
  /** Number of subjects on track (completion >= expected pace) */
  subjectsOnTrack: number;
  /** Number of subjects needing attention */
  subjectsNeedingAttention: number;
  /** Average completion percentage across all subjects */
  averageCoverage: number;
  /** Weeks remaining until exams */
  weeksRemaining: number;
}

interface HealthScoreInput {
  childCoverage: SubjectCoverage[];
  planOverview: PlanCoverageOverview | null;
}

/**
 * Calculate health score from child subject coverage and plan overview.
 * Score is a weighted composite of 4 sub-metrics, each 0-25, totalling 0-100.
 */
export function calculateHealthScore(input: HealthScoreInput): HealthScoreResult {
  const { childCoverage, planOverview } = input;
  const totalSubjects = childCoverage.length;

  // Default result when no data
  if (totalSubjects === 0 && !planOverview) {
    return {
      score: 0,
      ragStatus: 'needs_attention',
      subjectsOnTrack: 0,
      subjectsNeedingAttention: 0,
      averageCoverage: 0,
      weeksRemaining: 0,
    };
  }

  // Build a map of plan-level subject completion from PlanCoverageOverview if available
  const planSubjects = planOverview?.subjects ?? [];
  const planSubjectMap = new Map(
    planSubjects.map((s) => [s.subject_id, s])
  );

  // 1. Subjects On Track (0-25): subjects with meaningful activity or good plan completion
  const onTrackThreshold = 40; // Subject is "on track" if plan completion >= 40%
  const onTrackCount = childCoverage.filter((s) => {
    const planSubject = planSubjectMap.get(s.subject_id);
    if (planSubject && planSubject.planned_sessions > 0) {
      return (planSubject.completed_sessions / planSubject.planned_sessions) * 100 >= onTrackThreshold;
    }
    // No plan data — consider on track if they have any sessions completed
    return s.sessions_completed > 0;
  }).length;
  const subjectsOnTrackScore = totalSubjects > 0
    ? (onTrackCount / totalSubjects) * 25
    : 0;

  // 2. Attention Penalty (0-25): inverse — more subjects needing attention = lower score
  const attentionCount = totalSubjects - onTrackCount;
  const attentionScore = totalSubjects > 0
    ? 25 - (attentionCount * (25 / totalSubjects))
    : 0;

  // 3. Average Coverage (0-25): from plan overview totals or fallback to session activity
  const avgCompletion = planOverview?.totals?.completion_percent
    ?? (totalSubjects > 0
      ? (childCoverage.filter((s) => s.sessions_completed > 0).length / totalSubjects) * 100
      : 0);
  const coverageScore = (Math.min(avgCompletion, 100) / 100) * 25;

  // 4. Time Score (0-25): based on weeks remaining until exams
  const weeksRemaining = planOverview?.revision_period?.weeks_remaining ?? 0;
  let timeScore: number;
  if (weeksRemaining >= 8) timeScore = 25;
  else if (weeksRemaining >= 4) timeScore = 20;
  else if (weeksRemaining >= 2) timeScore = 15;
  else if (weeksRemaining >= 1) timeScore = 10;
  else timeScore = 5;

  // No plan means no time pressure context — give neutral score
  if (!planOverview || planOverview.status === 'no_plan') {
    timeScore = 12;
  }

  const score = Math.round(subjectsOnTrackScore + attentionScore + coverageScore + timeScore);

  // RAG mapping
  let ragStatus: HealthRAG;
  if (score >= 75) ragStatus = 'on_track';
  else if (score >= 50) ragStatus = 'keep_an_eye';
  else ragStatus = 'needs_attention';

  return {
    score: Math.min(score, 100),
    ragStatus,
    subjectsOnTrack: onTrackCount,
    subjectsNeedingAttention: attentionCount,
    averageCoverage: Math.round(avgCompletion),
    weeksRemaining: Math.round(weeksRemaining),
  };
}
