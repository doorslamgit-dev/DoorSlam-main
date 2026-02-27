// src/views/child/ChildTimetable.tsx
// Child's timetable view — adapts based on parental controls access level.
// Read-only (none), requires-approval, or auto-approved editing.

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { PageLayout } from "../../components/layout";
import {
  TimetableControls,
  TodayView,
  WeekView,
  MonthView,
} from "../../components/timetable";
import { useTimetableData } from "../../hooks/useTimetableData";
import { useChildAccess } from "../../hooks/useParentalControls";
import { submitApprovalRequest } from "../../services/parentalControlsService";
import Badge from "../../components/ui/Badge";
import Alert from "../../components/ui/Alert";

export default function ChildTimetable() {
  const navigate = useNavigate();
  const {
    user,
    activeChildId,
    loading: authLoading,
  } = useAuth();

  const { accessLevel, loading: accessLoading } = useChildAccess(
    activeChildId ?? undefined,
    "timetable_edit"
  );

  const {
    weekData,
    todaySessions,
    monthSessions,
    children: _children,
    selectedChildId: _selectedChildId,
    viewMode,
    referenceDate,
    loading,
    subjectLegend,
    dateOverrides,
    setViewMode,
    goToPrevious,
    goToNext,
    goToToday,
    refreshData,
    isDateBlocked,
  } = useTimetableData({
    userId: user?.id,
    initialChildId: activeChildId,
  });

  const [toast, setToast] = useState<string | null>(null);

  // Redirect if not a child
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/", { replace: true });
      return;
    }
    if (!activeChildId) {
      navigate("/parent", { replace: true });
    }
  }, [authLoading, user, activeChildId, navigate]);

  const canEdit = accessLevel === "auto_approved";
  const requiresApproval = accessLevel === "requires_approval";

  // Handler for requires_approval drag-and-drop
  const handleMoveRequiresApproval = useCallback(
    async (
      topicId: string,
      topicName: string,
      subjectName: string,
      sourceSessionId: string,
      targetSessionId: string,
      sourceLabel: string,
      targetLabel: string
    ) => {
      if (!activeChildId) return;

      const result = await submitApprovalRequest(
        activeChildId,
        "timetable_edit",
        "move_topic",
        {
          topic_id: topicId,
          topic_name: topicName,
          subject_name: subjectName,
          source_session_id: sourceSessionId,
          target_session_id: targetSessionId,
          source_label: sourceLabel,
          target_label: targetLabel,
        }
      );

      if (result.success) {
        setToast("Change submitted for parent approval");
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast("Failed to submit request");
        setTimeout(() => setToast(null), 3000);
      }
    },
    [activeChildId]
  );

  const handleViewModeChange = (mode: "today" | "week" | "month") => {
    setViewMode(mode);
  };

  if (authLoading || loading || accessLoading) {
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

  if (!user || !activeChildId) return null;

  return (
    <PageLayout>
      <main className="max-w-[1120px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Timetable</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Your revision schedule</p>
            </div>
          </div>
        </div>

        {/* Access level banner */}
        {accessLevel === "none" && (
          <Alert variant="info" className="mb-4">
            View only — ask your parent to enable timetable editing.
          </Alert>
        )}
        {requiresApproval && (
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="warning" badgeStyle="soft" size="sm" icon="shield">
              Changes need parent approval
            </Badge>
          </div>
        )}

        {/* Toast notification */}
        {toast && (
          <Alert variant="success" className="mb-4">
            {toast}
          </Alert>
        )}

        {/* Controls */}
        <TimetableControls
          viewMode={viewMode}
          referenceDate={referenceDate}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onViewModeChange={handleViewModeChange}
          onTodayClick={goToToday}
          subjectLegend={subjectLegend}
        />

        {/* Calendar views */}
        {viewMode === "today" && (
          <TodayView
            sessions={todaySessions}
            date={referenceDate}
            onAddSession={() => {}}
            loading={loading}
          />
        )}

        {viewMode === "week" && (
          <WeekView
            weekData={weekData}
            referenceDate={referenceDate}
            isDateBlocked={isDateBlocked}
            canEdit={canEdit || requiresApproval}
            onDataChanged={refreshData}
            onMoveRequiresApproval={
              requiresApproval ? handleMoveRequiresApproval : undefined
            }
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
    </PageLayout>
  );
}
