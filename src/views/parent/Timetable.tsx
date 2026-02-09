'use client';

// src/pages/parent/Timetable.tsx
// Refactored: Extracted components and hooks for better maintainability
// January 2026

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from "../../contexts/AuthContext";
import { PageLayout } from "../../components/layout";
import {
  TimetableHeader,
  TimetableHeroCard,
  TimetableActionCards,
  TimetableControls,
  TodayView,
  WeekView,
  MonthView,
  SubjectLegend,
  AddSessionModal,
  BlockDatesModal,
  EditScheduleModal,
} from "../../components/timetable";
import { useTimetableData } from "../../hooks/useTimetableData";

export default function Timetable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, activeChildId, loading: authLoading } = useAuth();

  const {
    weekData,
    todaySessions,
    monthSessions,
    children,
    selectedChildId,
    viewMode,
    referenceDate,
    loading,
    subjectLegend,
    planOverview,
    planOverviewLoading,
    dateOverrides,
    setSelectedChildId,
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
    initialChildId: searchParams.get("child"),
  });

  // Modal state
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [showBlockDatesModal, setShowBlockDatesModal] = useState(false);
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);

  // Get selected child name
  const selectedChildName =
    children.find((c) => c.child_id === selectedChildId)?.child_name || "Child";

  // Redirect if not logged in or is a child
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/");
      return;
    }

    if (activeChildId) {
      router.replace("/child/today");
      return;
    }
  }, [authLoading, user, activeChildId, router]);

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
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-neutral-600">Loading timetable...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user) return null;

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <TimetableHeader
          children={children}
          selectedChildId={selectedChildId}
          onChildChange={setSelectedChildId}
        />

        {/* Hero Card - Plan Overview */}
        <TimetableHeroCard
          planOverview={planOverview}
          loading={planOverviewLoading}
        />

        {/* Action Cards */}
        <TimetableActionCards
          onAddSession={() => setShowAddSessionModal(true)}
          onEditSchedule={handleEditSchedule}
          onBlockDates={() => setShowBlockDatesModal(true)}
        />

        {/* Timetable Controls */}
        <TimetableControls
          viewMode={viewMode}
          referenceDate={referenceDate}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onViewModeChange={handleViewModeChange}
          onTodayClick={goToToday}
        />

        {/* Today View */}
        {viewMode === "today" && (
          <TodayView
            sessions={todaySessions}
            date={referenceDate}
            onAddSession={() => setShowAddSessionModal(true)}
            loading={loading}
          />
        )}

        {/* Week View Grid */}
        {viewMode === "week" && (
          <WeekView
            weekData={weekData}
            referenceDate={referenceDate}
            isDateBlocked={isDateBlocked}
          />
        )}

        {/* Month View */}
        {viewMode === "month" && (
          <MonthView
            referenceDate={referenceDate}
            sessions={monthSessions}
            blockedDates={dateOverrides
              .filter((o) => o.override_type === "blocked")
              .map((o) => o.override_date)}
          />
        )}

        {/* Subject Legend */}
        <SubjectLegend subjects={subjectLegend} />
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
