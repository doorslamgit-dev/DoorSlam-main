import { useState, useEffect } from "react";
import {
  fetchChildrenForParent,
  fetchWeekPlan,
  fetchMonthSessions,
  fetchTodaySessions,
  fetchPlanCoverageOverview,
  fetchDateOverrides,
  extractSubjectLegend,
  getWeekStart,
  formatDateISO,
  type WeekDayData,
  type TimetableSession,
  type ChildOption,
  type SubjectLegend,
  type PlanCoverageOverview,
  type DateOverride,
} from "../services/timetableService";

export type ViewMode = "today" | "week" | "month";

interface UseTimetableDataProps {
  userId: string | undefined;
  initialChildId?: string | null;
}

interface UseTimetableDataReturn {
  weekData: WeekDayData[];
  todaySessions: TimetableSession[];
  monthSessions: TimetableSession[];
  children: ChildOption[];
  selectedChildId: string | null;
  viewMode: ViewMode;
  referenceDate: Date;
  loading: boolean;
  error: string | null;
  subjectLegend: SubjectLegend[];
  planOverview: PlanCoverageOverview | null;
  planOverviewLoading: boolean;
  dateOverrides: DateOverride[];
  setSelectedChildId: (id: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setReferenceDate: (date: Date) => void;
  setError: (error: string | null) => void;
  goToPrevious: () => void;
  goToNext: () => void;
  goToToday: () => void;
  refreshData: () => void;
  refreshPlanOverview: () => void;
  refreshOverrides: () => void;
  isDateBlocked: (dateStr: string) => boolean;
}

export function useTimetableData({
  userId,
  initialChildId,
}: UseTimetableDataProps): UseTimetableDataReturn {
  const [weekData, setWeekData] = useState<WeekDayData[]>([]);
  const [todaySessions, setTodaySessions] = useState<TimetableSession[]>([]);
  const [monthSessions, setMonthSessions] = useState<TimetableSession[]>([]);
  const [children, setChildren] = useState<ChildOption[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjectLegend, setSubjectLegend] = useState<SubjectLegend[]>([]);
  const [planOverview, setPlanOverview] = useState<PlanCoverageOverview | null>(
    null
  );
  const [planOverviewLoading, setPlanOverviewLoading] = useState(true);
  const [dateOverrides, setDateOverrides] = useState<DateOverride[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load children
  useEffect(() => {
    if (!userId) return;

    async function loadChildren() {
      const { data, error } = await fetchChildrenForParent(userId!);
      if (data && data.length > 0) {
        setChildren(data);

        if (initialChildId && data.some((c) => c.child_id === initialChildId)) {
          setSelectedChildId(initialChildId);
        } else {
          setSelectedChildId(data[0].child_id);
        }
      } else {
        setLoading(false);
        if (error) setError(error);
      }
    }

    loadChildren();
  }, [userId, initialChildId]);

  // Load plan overview when child changes
  useEffect(() => {
    if (!selectedChildId) return;

    async function loadPlanOverview() {
      setPlanOverviewLoading(true);
      const { data } = await fetchPlanCoverageOverview(selectedChildId!);
      setPlanOverview(data);
      setPlanOverviewLoading(false);
    }

    async function loadOverrides() {
      const { data } = await fetchDateOverrides(selectedChildId!);
      setDateOverrides(data || []);
    }

    loadPlanOverview();
    loadOverrides();
  }, [selectedChildId]);

  // Load sessions when child, view mode, or date changes
  useEffect(() => {
    if (!selectedChildId) return;

    async function loadSessions() {
      setLoading(true);
      setError(null);

      if (viewMode === "today") {
        const { data, error } = await fetchTodaySessions(
          selectedChildId!,
          formatDateISO(referenceDate)
        );

        if (error) {
          setError(error);
          setTodaySessions([]);
        } else {
          setTodaySessions(data || []);
          const legend: SubjectLegend[] = [];
          const seen = new Set<string>();
          (data || []).forEach((s) => {
            if (!seen.has(s.subject_id)) {
              seen.add(s.subject_id);
              legend.push({
                subject_id: s.subject_id,
                subject_name: s.subject_name,
                subject_color: s.color,
              });
            }
          });
          setSubjectLegend(legend);
        }
      } else if (viewMode === "month") {
        const { data, error } = await fetchMonthSessions(
          selectedChildId!,
          referenceDate.getFullYear(),
          referenceDate.getMonth()
        );

        if (error) {
          setError(error);
          setMonthSessions([]);
        } else {
          setMonthSessions(data || []);
          const legend: SubjectLegend[] = [];
          const seen = new Set<string>();
          (data || []).forEach((s) => {
            if (!seen.has(s.subject_id)) {
              seen.add(s.subject_id);
              legend.push({
                subject_id: s.subject_id,
                subject_name: s.subject_name,
                subject_color: s.color,
              });
            }
          });
          setSubjectLegend(legend);
        }
      } else {
        const weekStart = getWeekStart(referenceDate);
        const { data, error } = await fetchWeekPlan(
          selectedChildId!,
          formatDateISO(weekStart)
        );

        if (error) {
          setError(error);
          setWeekData([]);
        } else {
          setWeekData(data || []);
          setSubjectLegend(extractSubjectLegend(data || []));
        }
      }

      setLoading(false);
    }

    loadSessions();
  }, [selectedChildId, viewMode, referenceDate, refreshKey]);

  // Navigation functions
  const goToPrevious = () => {
    const newDate = new Date(referenceDate);
    if (viewMode === "today") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setReferenceDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(referenceDate);
    if (viewMode === "today") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setReferenceDate(newDate);
  };

  const goToToday = () => {
    setReferenceDate(new Date());
  };

  const refreshData = () => {
    setRefreshKey((k) => k + 1);
  };

  const refreshPlanOverview = async () => {
    if (selectedChildId) {
      const { data } = await fetchPlanCoverageOverview(selectedChildId);
      setPlanOverview(data);
    }
  };

  const refreshOverrides = async () => {
    if (selectedChildId) {
      const { data } = await fetchDateOverrides(selectedChildId);
      setDateOverrides(data || []);
    }
  };

  const isDateBlocked = (dateStr: string): boolean => {
    return dateOverrides.some(
      (o) => o.override_date === dateStr && o.override_type === "blocked"
    );
  };

  return {
    weekData,
    todaySessions,
    monthSessions,
    children,
    selectedChildId,
    viewMode,
    referenceDate,
    loading,
    error,
    subjectLegend,
    planOverview,
    planOverviewLoading,
    dateOverrides,
    setSelectedChildId,
    setViewMode,
    setReferenceDate,
    setError,
    goToPrevious,
    goToNext,
    goToToday,
    refreshData,
    refreshPlanOverview,
    refreshOverrides,
    isDateBlocked,
  };
}
