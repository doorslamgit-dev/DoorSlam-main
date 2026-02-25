// src/views/parent/Timetable.tsx
// Timetable page — time-slot grid, compact layout, nudge banner

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSelectedChild } from "../../contexts/SelectedChildContext";
import { PageLayout } from "../../components/layout";
import {
  TimetableHeader,
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

  // Loading state
  if (authLoading || loading) {
    return (
      <PageLayout>
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

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Row 1: Title + Nudge banner */}
        <div className="flex items-start justify-between mb-4">
          <TimetableHeader
            planOverview={planOverview}
            planOverviewLoading={planOverviewLoading}
          />
          <NudgeBanner
            planOverview={planOverview}
            planOverviewLoading={planOverviewLoading}
          />
        </div>

        {/* Row 2: Action buttons + status badge */}
        <TimetableActionCards
          onAddSession={() => setShowAddSessionModal(true)}
          onEditSchedule={handleEditSchedule}
          onBlockDates={() => setShowBlockDatesModal(true)}
          planOverview={planOverview}
          planOverviewLoading={planOverviewLoading}
        />

        {/* Row 3: Date nav + view toggle + subject legend */}
        <TimetableControls
          viewMode={viewMode}
          referenceDate={referenceDate}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onViewModeChange={handleViewModeChange}
          onTodayClick={goToToday}
          subjectLegend={subjectLegend}
        />

        {/* Row 4: Calendar views */}
        {viewMode === "today" && (
          <TodayView
            sessions={todaySessions}
            date={referenceDate}
            onAddSession={() => setShowAddSessionModal(true)}
            loading={loading}
          />
        )}

        {viewMode === "week" && (
          <WeekView
            weekData={weekData}
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
            sessions={monthSessions}
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
