// src/utils/timetableUtils.ts
// Utility functions extracted from timetable components for reuse

import type { PlanCoverageOverview } from '../services/timetableService';
import type { IconKey } from '../components/ui/AppIcon';

export interface TimetableStatus {
  key: 'complete' | 'on_track' | 'needs_attention' | 'behind' | 'no_plan';
  label: string;
  badgeVariant: 'success' | 'warning' | 'danger' | 'default';
  icon: IconKey;
  description: string;
}

/**
 * Calculate the timetable plan status from a PlanCoverageOverview.
 * Extracted from TimetableHeroCard for reuse in header badge.
 */
export function getTimetableStatus(planOverview: PlanCoverageOverview | null): TimetableStatus {
  if (!planOverview || planOverview.status === 'no_plan') {
    return {
      key: 'no_plan',
      label: 'No Plan',
      badgeVariant: 'default',
      icon: 'triangle-alert',
      description: 'No revision plan found',
    };
  }

  const { totals, pace, revision_period } = planOverview;
  const weeksRemaining = revision_period?.weeks_remaining || 0;
  const scheduledPerWeek =
    weeksRemaining > 0 ? Math.round(totals.planned_sessions / weeksRemaining) : 0;
  const neededPerWeek = pace?.sessions_per_week_needed || scheduledPerWeek;
  const scheduleGap = scheduledPerWeek - neededPerWeek;
  const completionPercent = totals.completion_percent || 0;

  if (completionPercent >= 100) {
    return {
      key: 'complete',
      label: 'Complete',
      badgeVariant: 'success',
      icon: 'circle-check',
      description: 'All sessions completed',
    };
  }

  if (scheduleGap >= 0) {
    return {
      key: 'on_track',
      label: 'On Track',
      badgeVariant: 'success',
      icon: 'circle-check',
      description: `${scheduledPerWeek} sessions/week scheduled`,
    };
  }

  if (scheduleGap >= -3) {
    return {
      key: 'needs_attention',
      label: 'Needs Attention',
      badgeVariant: 'warning',
      icon: 'triangle-alert',
      description: `${Math.abs(scheduleGap)} more sessions/week recommended`,
    };
  }

  return {
    key: 'behind',
    label: 'Behind Schedule',
    badgeVariant: 'danger',
    icon: 'flame',
    description: `${Math.abs(scheduleGap)} more sessions/week needed`,
  };
}

/**
 * Time-of-day display labels for grid headers
 */
export const TIME_SLOT_LABELS: Record<string, string> = {
  early_morning: 'Early Morning',
  morning: 'Morning',
  afternoon: 'Afternoon',
  after_school: 'After School',
  evening: 'Evening',
};

/**
 * Ordered list of all time slots for grid rendering
 */
export const TIME_SLOT_ORDER = [
  'early_morning',
  'morning',
  'afternoon',
  'after_school',
  'evening',
] as const;
