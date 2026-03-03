// src/views/parent/Timetable.tsx
// Timetable page — time-slot grid, compact layout, nudge banner

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSelectedChild } from "../../contexts/SelectedChildContext";
import { PageLayout, PageChildHeader } from "../../components/layout";
import Badge from "../../components/ui/Badge";
import {
  TimetableActionCards,
  TimetableControls,
  TodayView,
  WeekView,
  MonthView,
  NudgeBanner,
  AddSessionModal,
  BlockDatesModal,
  EditScheduleModal,
} from "../../components/timetable";
import { useTimetableData } from "../../hooks/useTimetableData";
import { getTimetableStatus } from "../../utils/timetableUtils";
import { hexToRgba } from "../../utils/colorUtils";

export default function Timetable() {
  const navigate = useNavigate();
  const { user, activeChildId, loading: authLoading } = useAuth();
  const { selectedChildId } = useSelectedChild();

  const {
    weekData,
    todaySessions,
    monthSessions,
    viewMode,
    referenceDate,
    loading,
    subjectLegend,
    planOverview,
    planOverviewLoading,
    dateOverrides,
    setViewMode,
    goToPrevious,
    goToNext,
    goToToday,
    refreshData,
    refreshPlanOverview,
    refreshOverrides,
    isDateBlocked,
  } = useTimetableData({
    userId: user?.id,
    initialChildId: selectedChildId,
  });

  // Modal state
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [showBlockDatesModal, setShowBlockDatesModal] = useState(false);
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);

  // Subject filter state — empty array means "show all"
  const [activeSubjectFilters, setActiveSubjectFilters] = useState<string[]>([]);

  // Get selected child name from context
  const { selectedChildName } = useSelectedChild();

  // Redirect if not logged in or is a child
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    if (activeChildId) {
      navigate("/child/today", { replace: true });
      return;
    }
  }, [authLoading, user, activeChildId, navigate]);

  // Reset filters when child changes
  useEffect(() => {
    setActiveSubjectFilters([]);
  }, [selectedChildId]);

  // Handlers
  const handleSessionAdded = () => {
    refreshData();
    refreshPlanOverview();
  };

  const handleDatesChanged = () => {
    refreshOverrides();
    refreshPlanOverview();
    refreshData();
  };

  const handleEditSchedule = () => {
    setShowEditScheduleModal(true);
  };

  const handleScheduleUpdated = () => {
    refreshData();
    refreshPlanOverview();
  };

  const handleViewModeChange = (mode: "today" | "week" | "month") => {
    setViewMode(mode);
  };

  const toggleSubjectFilter = (subjectId: string) => {
    setActiveSubjectFilters((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  // Filtered sessions derived from active filters (empty = show all)
  const isFiltered = activeSubjectFilters.length > 0;

  const filteredTodaySessions = isFiltered
    ? todaySessions.filter((s) => activeSubjectFilters.includes(s.subject_id))
    : todaySessions;

  const filteredWeekData = isFiltered
    ? weekData.map((day) => ({
        ...day,
        sessions: day.sessions.filter((s) =>
          activeSubjectFilters.includes(s.subject_id)
        ),
      }))
    : weekData;

  const filteredMonthSessions = isFiltered
    ? monthSessions.filter((s) => activeSubjectFilters.includes(s.subject_id))
    : monthSessions;

  // Loading state
  if (authLoading || loading) {
    return (
      <PageLayout hideFooter>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading timetable...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user) return null;

  const timetableStatus = getTimetableStatus(planOverview);
  const timetableSubtitle = planOverviewLoading
    ? 'Loading plan status...'
    : timetableStatus.key === 'no_plan'
    ? 'No revision plan found'
    : timetableStatus.description;

  return (
    <PageLayout hideFooter>
      <main className="max-w-content mx-auto px-6 py-8">
        {/* Row 1: Page Header + Nudge banner */}
        <PageChildHeader
          title="Timetable"
          subtitle={timetableSubtitle}
          banner={
            <NudgeBanner
              planOverview={planOverview}
              planOverviewLoading={planOverviewLoading}
            />
          }
        />

        {/* Row 2: Action buttons + date nav + view toggle + status badge */}
        <div className="mb-4 flex items-center justify-between">
          <TimetableActionCards
            onAddSession={() => setShowAddSessionModal(true)}
            onEditSchedule={handleEditSchedule}
            onBlockDates={() => setShowBlockDatesModal(true)}
          />
          <div className="flex items-center gap-4">
            <TimetableControls
              viewMode={viewMode}
              referenceDate={referenceDate}
              onPrevious={goToPrevious}
              onNext={goToNext}
              onViewModeChange={handleViewModeChange}
              onTodayClick={goToToday}
            />
            {!planOverviewLoading && timetableStatus.key !== "no_plan" && (
              <Badge
                variant={timetableStatus.badgeVariant}
                badgeStyle="soft"
                size="md"
                icon={timetableStatus.icon}
              >
                {timetableStatus.label}
              </Badge>
            )}
          </div>
        </div>

        {/* Row 3: Subject filter capsules */}
        {subjectLegend.length > 0 && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            {subjectLegend.map((subject) => {
              const active = activeSubjectFilters.includes(subject.subject_id);
              return (
                <button
                  key={subject.subject_id}
                  onClick={() => toggleSubjectFilter(subject.subject_id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                    active
                      ? "border-transparent"
                      : "bg-background border-border text-muted-foreground hover:border-input"
                  }`}
                  style={
                    active
                      ? {
                          backgroundColor: hexToRgba(subject.subject_color, 0.12),
                          borderColor: subject.subject_color,
                          color: subject.subject_color,
                        }
                      : undefined
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: subject.subject_color }}
                  />
                  {subject.subject_name}
                </button>
              );
            })}
            {isFiltered && (
              <button
                onClick={() => setActiveSubjectFilters([])}
                className="px-3 py-1.5 rounded-full border border-border text-sm text-muted-foreground hover:border-input hover:text-foreground transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Row 4: Calendar views */}
        {viewMode === "today" && (
          <TodayView
            sessions={filteredTodaySessions}
            date={referenceDate}
            onAddSession={() => setShowAddSessionModal(true)}
            loading={loading}
          />
        )}

        {viewMode === "week" && (
          <WeekView
            weekData={filteredWeekData}
            referenceDate={referenceDate}
            isDateBlocked={isDateBlocked}
            canEdit={true}
            childId={selectedChildId || undefined}
            onDataChanged={handleSessionAdded}
          />
        )}

        {viewMode === "month" && (
          <MonthView
            referenceDate={referenceDate}
            sessions={filteredMonthSessions}
            blockedDates={dateOverrides
              .filter((o) => o.override_type === "blocked")
              .map((o) => o.override_date)}
          />
        )}
      </main>

      {/* Modals */}
      <AddSessionModal
        isOpen={showAddSessionModal}
        onClose={() => setShowAddSessionModal(false)}
        childId={selectedChildId || ""}
        selectedDate={viewMode === "today" ? referenceDate : undefined}
        onSessionAdded={handleSessionAdded}
        onEditSchedule={handleEditSchedule}
      />

      <BlockDatesModal
        isOpen={showBlockDatesModal}
        onClose={() => setShowBlockDatesModal(false)}
        childId={selectedChildId || ""}
        childName={selectedChildName}
        onDatesChanged={handleDatesChanged}
      />

      <EditScheduleModal
        isOpen={showEditScheduleModal}
        onClose={() => setShowEditScheduleModal(false)}
        childId={selectedChildId || ""}
        childName={selectedChildName}
        onScheduleUpdated={handleScheduleUpdated}
      />
    </PageLayout>
  );
}
