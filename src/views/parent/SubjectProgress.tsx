

// src/views/parent/SubjectProgress.tsx
// Refactored: Extracted components and hooks for better maintainability
// January 2026
// Updated (fix): Remove local STATUS_COLORS / STATUS_CONTENT. Use centralised statusStyles.

import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import { PageLayout } from "../../components/layout";
import {
  SubjectCard,
  CoverageSummary,
  QuickStats,
  RecentActivity,
  SubjectProgressHeader,
  StatsGrid,
  EmptySubjectsState,
} from "../../components/subjects";
import AddSubjectModal from "../../components/subjects/AddSubjectModal";
import { useSubjectProgressData } from "../../hooks/useSubjectProgressData";
import { getStatusUI, type StatusIndicator } from "../../utils/statusStyles";

function safeStatusIndicator(value: unknown): StatusIndicator | null {
  if (
    value === "on_track" ||
    value === "keep_an_eye" ||
    value === "needs_attention" ||
    value === "getting_started"
  ) {
    return value;
  }
  return null;
}

export default function SubjectProgress() {
  const navigate = useNavigate();
  const { user, activeChildId, loading: authLoading } = useAuth();

  const {
    data,
    children,
    selectedChildId,
    loading,
    error,
    setSelectedChildId,
    refreshData,
  } = useSubjectProgressData({
    userId: user?.id,
  });

  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);

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

  const handleAddSubject = () => {
    setIsAddSubjectModalOpen(true);
  };

  const handleAddSubjectSuccess = () => {
    refreshData();
  };

  if (authLoading || loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Loading subject progress...
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user) return null;

  if (error) {
    return (
      <PageLayout>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="rounded-2xl p-6 text-center bg-destructive/10 border border-danger-border">
            <p className="font-medium text-destructive">
              Failed to load subject progress
            </p>
            <p className="text-sm mt-1 text-destructive">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 text-white rounded-lg hover:opacity-90 bg-destructive"
            >
              Try Again
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!data || !data.child) {
    return (
      <PageLayout>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-background rounded-2xl shadow-sm p-8 text-center">
            <p className="text-muted-foreground">
              No children found. Please add a child first.
            </p>
            <button
              onClick={() => navigate("/parent/onboarding")}
              className="mt-4 px-4 py-2 text-white rounded-full hover:opacity-90 bg-primary"
            >
              Add Child
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Centralised status
  const childRecord = data.child as unknown as Record<string, unknown>;
  const rpcStatus = childRecord.status_indicator;
  const childStatus = safeStatusIndicator(rpcStatus) ?? "on_track";
  const ui = getStatusUI(childStatus);

  // Prefer RPC-provided label/detail, fall back to central label
  const childStatusLabel =
    (childRecord.status_label as string) || ui.badgeText || "On Track";
  const childStatusDetail = (childRecord.status_detail as string) || "";

  const totalSubjects = data.subjects.length;
  const subjectsNeedingAttention = data.subjects.filter(
    (s) => s.status === "needs_attention"
  );
  const subjectsOnTrack = data.subjects.filter(
    (s) => s.status === "in_progress" || s.status === "completed"
  ).length;

  const sessionsThisWeek = data.child.sessions_this_week || 0;
  const topicsCoveredThisWeek = data.child.topics_covered_this_week || 0;

  const avgCoverage =
    totalSubjects > 0
      ? Math.round(
          data.subjects.reduce((sum, s) => sum + s.completion_percentage, 0) /
            totalSubjects
        )
      : 0;

  const weeksUntilExams = 12;

  const getHeadlineContent = () => {
    if (totalSubjects === 0) {
      return {
        headline: "Let's get started",
        message:
          "Add subjects to begin tracking your child's revision progress.",
      };
    }

    if (childStatusDetail) {
      return {
        headline:
          childStatus === "on_track"
            ? "All subjects on track"
            : childStatus === "keep_an_eye"
            ? "Worth keeping an eye on"
            : childStatus === "needs_attention"
            ? "Some sessions need attention"
            : "Great start to revision",
        message: childStatusDetail,
      };
    }

    switch (childStatus) {
      case "needs_attention":
        return {
          headline: "Some sessions need attention",
          message: "A gentle check-in could help get things back on track.",
        };
      case "keep_an_eye":
        return {
          headline: "Worth keeping an eye on",
          message: "Activity has slowed slightly. Nothing to worry about yet.",
        };
      case "getting_started":
        return {
          headline: "Great start to revision",
          message: "The first sessions are always the hardest — doing great!",
        };
      default:
        return {
          headline: "All subjects on track",
          message: "Great progress! All subjects are being covered as planned.",
        };
    }
  };

  const headlineContent = getHeadlineContent();
  const existingSubjectIds = data.subjects.map((s) => s.subject_id);
  const selectedChild = children.find((c) => c.child_id === selectedChildId);
  const childName =
    selectedChild?.child_name || data.child.child_name || "Your child";

  return (
    <PageLayout>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <section className="mb-8">
          <SubjectProgressHeader
            children={children}
            selectedChildId={selectedChildId}
            totalSubjects={totalSubjects}
            childStatus={childStatus}
            childStatusLabel={childStatusLabel}
            headline={headlineContent.headline}
            message={headlineContent.message}
            onChildChange={setSelectedChildId}
            onDashboardClick={() => navigate("/parent/dashboard")}
            onScheduleClick={() => navigate("/parent/timetable")}
            onAddSubject={handleAddSubject}
          />

          {/* Stats Grid */}
          <div className="mt-6">
            <StatsGrid
              totalSubjects={totalSubjects}
              sessionsThisWeek={sessionsThisWeek}
              topicsCoveredThisWeek={topicsCoveredThisWeek}
              subjectsNeedingAttention={subjectsNeedingAttention.length}
            />
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subject Cards Grid */}
          <div className="lg:col-span-2 space-y-6">
            {data.subjects.map((subject) => (
              <SubjectCard key={subject.subject_id} subject={subject} />
            ))}

            {data.subjects.length === 0 && (
              <EmptySubjectsState onAddSubject={handleAddSubject} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <CoverageSummary subjects={data.subjects} />
            <QuickStats
              subjectsOnTrack={subjectsOnTrack}
              totalSubjects={totalSubjects}
              needsAttention={subjectsNeedingAttention.length}
              avgCoverage={avgCoverage}
              weeksUntilExams={weeksUntilExams}
            />
            <RecentActivity subjects={data.subjects} />
          </div>
        </div>
      </main>

      {/* Add Subject Modal */}
      {selectedChildId && (
        <AddSubjectModal
          childId={selectedChildId}
          childName={childName}
          existingSubjectIds={existingSubjectIds}
          existingSubjects={
            data?.subjects.map((s) => ({
              subject_id: s.subject_id,
              subject_name: s.subject_name,
              exam_board_name: s.exam_board_name,
              current_grade: s.current_grade,
              target_grade: s.target_grade,
              icon: s.icon,
              color: s.color,
            })) || []
          }
          isOpen={isAddSubjectModalOpen}
          onClose={() => setIsAddSubjectModalOpen(false)}
          onSuccess={handleAddSubjectSuccess}
        />
      )}
    </PageLayout>
  );
}
