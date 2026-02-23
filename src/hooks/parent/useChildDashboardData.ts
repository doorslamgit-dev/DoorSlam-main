// src/hooks/parent/useChildDashboardData.ts
// Composite data hook for the child-specific parent dashboard (V3)
// Orchestrates: family data + child filtering + plan overview + rewards

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useParentDashboardData } from './useParentDashboardData';
import { useRewardTemplates } from './rewards/useRewardTemplates';
import { fetchPlanCoverageOverview } from '../../services/timetableService';
import type { PlanCoverageOverview } from '../../services/timetableService';
import type {
  ChildSummary,
  ComingUpSession,
  SubjectCoverage,
  ProgressMoment,
  GentleReminder,
  DailyPattern,
  WeekSummary,
  ParentDashboardData,
} from '../../types/parent/parentDashboardTypes';
import type { EnabledReward } from '../../types/parent/rewardTypes';

interface UseChildDashboardDataOptions {
  initialChildId?: string | null;
  enableRealtime?: boolean;
  enableVisibilityRefresh?: boolean;
  refreshThrottleMs?: number;
}

export interface UseChildDashboardDataResult {
  /** Full family data (for children list in selector) */
  data: ParentDashboardData | null;
  /** Currently selected child ID */
  selectedChildId: string | null;
  /** The selected child's summary object */
  selectedChild: ChildSummary | null;
  /** Family-level week summary */
  weekSummary: WeekSummary | null;
  /** Family-level daily pattern (TODO: per-child when RPC v1.4 available) */
  dailyPattern: DailyPattern[];
  /** Coming up sessions filtered to selected child */
  childComingUp: ComingUpSession[];
  /** Subject coverage filtered to selected child */
  childCoverage: SubjectCoverage[];
  /** Progress moments filtered to selected child */
  childMoments: ProgressMoment[];
  /** Gentle reminders filtered to selected child */
  childReminders: GentleReminder[];
  /** Revision plan overview for selected child */
  planOverview: PlanCoverageOverview | null;
  planOverviewLoading: boolean;
  /** Enabled rewards for selected child */
  enabledRewards: EnabledReward[];
  rewardsLoading: boolean;
  /** Overall loading state */
  loading: boolean;
  error: string | null;
  /** Force refresh all data */
  refresh: () => Promise<void>;
  /** Change the selected child */
  setSelectedChildId: (id: string) => void;
}

export function useChildDashboardData(
  options: UseChildDashboardDataOptions = {}
): UseChildDashboardDataResult {
  const [searchParams, setSearchParams] = useSearchParams();

  // Base family data from existing hook
  const {
    data,
    loading: familyLoading,
    error: familyError,
    refresh: familyRefresh,
  } = useParentDashboardData({
    enableRealtime: options.enableRealtime ?? true,
    enableVisibilityRefresh: options.enableVisibilityRefresh ?? true,
    refreshThrottleMs: options.refreshThrottleMs ?? 30000,
  });

  // Child selection state
  const [selectedChildId, setSelectedChildIdInternal] = useState<string | null>(
    options.initialChildId ?? searchParams.get('child') ?? null
  );

  // Plan overview state
  const [planOverview, setPlanOverview] = useState<PlanCoverageOverview | null>(null);
  const [planOverviewLoading, setPlanOverviewLoading] = useState(false);

  // Sync from URL param when it changes (e.g. sidebar navigation)
  const childParam = searchParams.get('child');
  useEffect(() => {
    if (childParam && childParam !== selectedChildId) {
      setSelectedChildIdInternal(childParam);
    }
  }, [childParam, selectedChildId]);

  // Auto-select first child when data loads and no child is selected
  useEffect(() => {
    if (data?.children?.length && !selectedChildId) {
      const firstChildId = data.children[0].child_id;
      setSelectedChildIdInternal(firstChildId);
    }
  }, [data?.children, selectedChildId]);

  // Validate selected child exists in data
  useEffect(() => {
    if (data?.children?.length && selectedChildId) {
      const exists = data.children.some((c) => c.child_id === selectedChildId);
      if (!exists) {
        setSelectedChildIdInternal(data.children[0].child_id);
      }
    }
  }, [data?.children, selectedChildId]);

  // Public setter that also updates URL
  const setSelectedChildId = useCallback(
    (id: string) => {
      setSelectedChildIdInternal(id);
      setSearchParams({ child: id }, { replace: true });
    },
    [setSearchParams]
  );

  // Fetch plan overview when child changes
  useEffect(() => {
    if (!selectedChildId) {
      setPlanOverview(null);
      return;
    }

    let cancelled = false;
    setPlanOverviewLoading(true);

    fetchPlanCoverageOverview(selectedChildId).then((result) => {
      if (!cancelled) {
        setPlanOverview(result.data);
        setPlanOverviewLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedChildId]);

  // Rewards for selected child
  const { enabledRewards, loading: rewardsLoading } = useRewardTemplates(selectedChildId);

  // Derive filtered data via useMemo
  const selectedChild = useMemo(
    () => data?.children?.find((c) => c.child_id === selectedChildId) ?? null,
    [data?.children, selectedChildId]
  );

  const childComingUp = useMemo(
    () => data?.coming_up_next?.filter((s) => s.child_id === selectedChildId) ?? [],
    [data?.coming_up_next, selectedChildId]
  );

  const childCoverage = useMemo(
    () => data?.subject_coverage?.filter((s) => s.child_id === selectedChildId) ?? [],
    [data?.subject_coverage, selectedChildId]
  );

  const childMoments = useMemo(
    () => data?.progress_moments?.filter((m) => m.child_id === selectedChildId) ?? [],
    [data?.progress_moments, selectedChildId]
  );

  const childReminders = useMemo(
    () => data?.gentle_reminders?.filter((r) => r.child_id === selectedChildId) ?? [],
    [data?.gentle_reminders, selectedChildId]
  );

  // Composite refresh
  const refresh = useCallback(async () => {
    await familyRefresh();
    if (selectedChildId) {
      const result = await fetchPlanCoverageOverview(selectedChildId);
      setPlanOverview(result.data);
    }
  }, [familyRefresh, selectedChildId]);

  return {
    data,
    selectedChildId,
    selectedChild,
    weekSummary: data?.week_summary ?? null,
    dailyPattern: data?.daily_pattern ?? [],
    childComingUp,
    childCoverage,
    childMoments,
    childReminders,
    planOverview,
    planOverviewLoading,
    enabledRewards,
    rewardsLoading,
    loading: familyLoading,
    error: familyError,
    refresh,
    setSelectedChildId,
  };
}

export default useChildDashboardData;
