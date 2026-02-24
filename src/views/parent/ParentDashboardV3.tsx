// src/views/parent/ParentDashboardV3.tsx
// Parent Dashboard v3 — Child-specific dashboard matching Figma design

import { lazy, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChildDashboardData } from '../../hooks/parent/useChildDashboardData';
import { DashboardChildHeader } from '../../components/parent/dashboard/DashboardChildHeader';
import { DashboardHeroCard } from '../../components/parent/dashboard/DashboardHeroCard';
import { HealthScoreCard } from '../../components/parent/dashboard/HealthScoreCard';
import { DashboardWeeklyProgress } from '../../components/parent/dashboard/DashboardWeeklyProgress';
import { DashboardTodaySessions } from '../../components/parent/dashboard/DashboardTodaySessions';
import { DashboardRevisionPlan } from '../../components/parent/dashboard/DashboardRevisionPlan';
import { DashboardRecentActivity } from '../../components/parent/dashboard/DashboardRecentActivity';
import { DashboardProgressMoments } from '../../components/parent/dashboard/DashboardProgressMoments';
import { DashboardComingUpNext } from '../../components/parent/dashboard/DashboardComingUpNext';
import { DashboardActiveRewards } from '../../components/parent/dashboard/DashboardActiveRewards';
import { DashboardNotificationBanner } from '../../components/parent/dashboard/DashboardNotificationBanner';
import AppIcon from '../../components/ui/AppIcon';

const DashboardInviteModal = lazy(
  () => import('../../components/parent/dashboard/DashboardInviteModal')
);

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-content mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8 animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-40" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-200 rounded-full" />
            <div className="space-y-1">
              <div className="h-4 bg-neutral-200 rounded w-24" />
              <div className="h-3 bg-neutral-100 rounded w-20" />
            </div>
          </div>
        </div>
        <div className="bg-neutral-0 rounded-2xl shadow-card p-8 animate-pulse mb-8">
          <div className="h-8 bg-primary-100 rounded w-1/3 mb-4" />
          <div className="h-4 bg-primary-100 rounded w-2/3 mb-8" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-neutral-100 rounded-xl" />
            <div className="h-24 bg-neutral-100 rounded-xl" />
            <div className="h-24 bg-neutral-100 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="h-64 bg-neutral-0 rounded-2xl shadow-card animate-pulse" />
          <div className="h-64 bg-neutral-0 rounded-2xl shadow-card animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-accent-red/5 border border-accent-red/20 rounded-2xl p-8 text-center">
      <div className="w-16 h-16 bg-accent-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <AppIcon name="triangle-alert" className="w-8 h-8 text-accent-red" />
      </div>
      <h3 className="text-lg font-bold text-primary-900 mb-2">Something went wrong</h3>
      <p className="text-neutral-600 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

function ParentDashboardV3Inner() {
  const navigate = useNavigate();

  const {
    data,
    selectedChild,
    selectedChildId,
    setSelectedChildId,
    dailyPattern,
    childComingUp,
    childCoverage,
    childMoments,
    childReminders,
    planOverview,
    planOverviewLoading,
    enabledRewards,
    rewardsLoading,
    loading,
    error,
    refresh,
  } = useChildDashboardData({ enableRealtime: true, enableVisibilityRefresh: true });

  const [showInviteModal, setShowInviteModal] = useState(false);

  const navigateWithScroll = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSetupSchedule = () => {
    navigateWithScroll(`/parent/onboarding?phase=schedule&child=${selectedChildId}`);
  };

  const handleInviteChild = () => {
    setShowInviteModal(true);
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'adjust-plan':
        navigateWithScroll(`/parent/timetable${selectedChildId ? `?child=${selectedChildId}` : ''}`);
        break;
      case 'review-topics':
        navigateWithScroll(`/parent/insights${selectedChildId ? `?child=${selectedChildId}` : ''}`);
        break;
      case 'export':
        navigateWithScroll(`/parent/insights${selectedChildId ? `?child=${selectedChildId}` : ''}`);
        break;
      case 'keep-plan':
        break;
    }
  };

  const handleViewDetailedBreakdown = () => {
    navigateWithScroll('/parent/insights');
  };

  const handleEditSchedule = () => {
    navigateWithScroll(`/parent/timetable${selectedChildId ? `?child=${selectedChildId}` : ''}`);
  };

  const handleConfigureRewards = () => {
    navigateWithScroll(`/parent/rewards${selectedChildId ? `?child=${selectedChildId}` : ''}`);
  };

  const handleAddSubject = () => {
    navigateWithScroll(`/parent/subjects${selectedChildId ? `?child=${selectedChildId}` : ''}`);
  };

  const handleProgressReport = () => {
    navigateWithScroll(`/parent/insights/report${selectedChildId ? `?child=${selectedChildId}` : ''}`);
  };

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="max-w-content mx-auto px-6 py-8">
          <ErrorState message={error} onRetry={refresh} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="max-w-content mx-auto px-6 py-8">
          <ErrorState message="No data available" onRetry={refresh} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <main className="max-w-content mx-auto px-4 py-4 lg:px-6 lg:py-5 pb-24">
        {/* Contextual notification banner — shown when child needs attention */}
        {selectedChild && <DashboardNotificationBanner child={selectedChild} />}

        {/* Page Header: Dashboard title + subtitle + child selector */}
        <DashboardChildHeader
          child={selectedChild}
          children={data.children}
          onChildChange={setSelectedChildId}
        />

        {/* Row 1: Hero (2/3) + Health Score (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2">
            <DashboardHeroCard
              child={selectedChild}
              childCoverage={childCoverage}
              onActionClick={handleActionClick}
              onViewDetailedBreakdown={handleViewDetailedBreakdown}
              planOverview={planOverview}
              onSetupSchedule={handleSetupSchedule}
              onInviteChild={handleInviteChild}
              loading={false}
            />
          </div>
          <HealthScoreCard
            child={selectedChild}
            childCoverage={childCoverage}
            planOverview={planOverview}
            loading={planOverviewLoading}
          />
        </div>

        {/* Row 2: This Week's Progress — full width */}
        <div className="mb-4">
          <DashboardWeeklyProgress child={selectedChild} dailyPattern={dailyPattern} />
        </div>

        {/* Row 3: Today's Sessions (left) + Revision Plan (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <DashboardTodaySessions sessions={childComingUp} reminders={childReminders} />
          <DashboardRevisionPlan
            planOverview={planOverview}
            loading={planOverviewLoading}
            onEditSchedule={handleEditSchedule}
          />
        </div>

        {/* Row 4: Recent Activity + Progress Moments + Coming Up Next */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <DashboardRecentActivity comingUp={childComingUp} coverage={childCoverage} />
          <DashboardProgressMoments moments={childMoments} />
          <DashboardComingUpNext sessions={childComingUp} />
        </div>

        {/* Row 5: Active Rewards — full width */}
        <DashboardActiveRewards
          rewards={enabledRewards}
          loading={rewardsLoading}
          onConfigureRewards={handleConfigureRewards}
        />

        {/* Invite child modal (lazy-loaded) */}
        {showInviteModal && selectedChild && (
          <DashboardInviteModal
            childId={selectedChild.child_id}
            childName={selectedChild.first_name}
            invitationCode={selectedChild.invitation_code ?? null}
            onClose={() => setShowInviteModal(false)}
          />
        )}
      </main>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-sticky pointer-events-none">
        <div className="max-w-content mx-auto px-4 lg:px-6 pb-4 flex justify-end pointer-events-auto">
          <div className="flex items-center gap-2 bg-neutral-0 border border-neutral-200 rounded-2xl shadow-lg px-3 py-2">
            <button
              onClick={handleEditSchedule}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <AppIcon name="calendar" className="w-4 h-4" />
              Schedule
            </button>
            <div className="w-px h-5 bg-neutral-200" />
            <button
              onClick={handleAddSubject}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <AppIcon name="plus-circle" className="w-4 h-4" />
              Add New Subject
            </button>
            <div className="w-px h-5 bg-neutral-200" />
            <button
              onClick={handleProgressReport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <AppIcon name="chart-bar" className="w-4 h-4" />
              Progress Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ParentDashboardV3() {
  return <ParentDashboardV3Inner />;
}

export default ParentDashboardV3;
