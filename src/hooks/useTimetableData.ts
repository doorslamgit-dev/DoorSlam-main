import { useState, useEffect, useRef } from "react";
import {
  fetchChildrenForParent,
  fetchWeekPlan,
  fetchMonthSessions,
  fetchTodaySessions,
  fetchPlanCoverageOverview,
  fetchDateOverrides,
  fetchChildSubjects,
  fetchWeeklyTemplate,
  extractSubjectLegend,
  getWeekStart,
  formatDateISO,
  type WeekDayData,
  type TimetableSession,
  type ChildOption,
  type SubjectLegend,
  type PlanCoverageOverview,
  type DateOverride,
  type DayTemplate,
} from "../services/timetableService";
import { buildSubjectColorMap } from "../utils/colorUtils";

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
  subjectColorMap: Record<string, string>;
  weeklyTemplate: DayTemplate[];
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
  const [subjectColorMap, setSubjectColorMap] = useState<Record<string, string>>({});
  const [planOverview, setPlanOverview] = useState<PlanCoverageOverview | null>(
    null
  );
  const [planOverviewLoading, setPlanOverviewLoading] = useState(true);
  const [dateOverrides, setDateOverrides] = useState<DateOverride[]>([]);
  const [weeklyTemplate, setWeeklyTemplate] = useState<DayTemplate[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const skipNextLoading = useRef(false);

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

  // Sync when the global child context changes (sidebar selector)
  useEffect(() => {
    if (initialChildId) {
      setSelectedChildId(initialChildId);
    }
  }, [initialChildId]);

  // Build palette color map when child changes
  useEffect(() => {
    if (!selectedChildId) return;

    async function loadSubjectColors() {
      const { data } = await fetchChildSubjects(selectedChildId!);
      if (data && data.length > 0) {
        const colorMap = buildSubjectColorMap(data.map((s) => s.subject_id));
        setSubjectColorMap(colorMap);
      }
    }

    loadSubjectColors();
  }, [selectedChildId]);

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

    async function loadTemplate() {
      const { data } = await fetchWeeklyTemplate(selectedChildId!);
      setWeeklyTemplate(data || []);
    }

    loadPlanOverview();
    loadOverrides();
    loadTemplate();
  }, [selectedChildId]);

  // Load sessions when child, view mode, or date changes
  useEffect(() => {
    if (!selectedChildId) return;

    // Apply palette colors to a flat list of sessions
    function applyColors(
      sessions: TimetableSession[],
      colorMap: Record<string, string>
    ): TimetableSession[] {
      return sessions.map((s) => {
        const color = colorMap[s.subject_id] ?? s.color;
        return {
          ...s,
          color,
          topics_preview: s.topics_preview.map((t) => ({
            ...t,
            subject_color: colorMap[t.subject_id] ?? colorMap[s.subject_id] ?? t.subject_color,
          })),
        };
      });
    }

    // Build legend from a (already color-remapped) flat session list
    function buildLegend(sessions: TimetableSession[]): SubjectLegend[] {
      const legend: SubjectLegend[] = [];
      const seen = new Set<string>();
      sessions.forEach((s) => {
        if (!seen.has(s.subject_id)) {
          seen.add(s.subject_id);
          legend.push({
            subject_id: s.subject_id,
            subject_name: s.subject_name,
            subject_color: s.color,
          });
        }
      });
      return legend;
    }

    async function loadSessions() {
      if (!skipNextLoading.current) {
        setLoading(true);
      }
      skipNextLoading.current = false;
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
          const colored = applyColors(data || [], subjectColorMap);
          setTodaySessions(colored);
          setSubjectLegend(buildLegend(colored));
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
          const colored = applyColors(data || [], subjectColorMap);
          setMonthSessions(colored);
          setSubjectLegend(buildLegend(colored));
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
          const coloredWeek = (data || []).map((day) => ({
            ...day,
            sessions: applyColors(day.sessions, subjectColorMap),
          }));
          setWeekData(coloredWeek);
          setSubjectLegend(extractSubjectLegend(coloredWeek));
        }
      }

      setLoading(false);
    }

    loadSessions();
  }, [selectedChildId, viewMode, referenceDate, refreshKey, subjectColorMap]);

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
    skipNextLoading.current = true;
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
    subjectColorMap,
    weeklyTemplate,
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
