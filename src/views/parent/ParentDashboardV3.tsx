// src/views/parent/ParentDashboardV3.tsx
// Parent Dashboard v3 — Child-specific dashboard with hero, health score, revision plan, activity

import { lazy, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChildDashboardData } from '../../hooks/parent/useChildDashboardData';
import { DashboardHeroCard } from '../../components/parent/dashboard/DashboardHeroCard';
import { HealthScoreCard } from '../../components/parent/dashboard/HealthScoreCard';
import { DashboardRevisionPlan } from '../../components/parent/dashboard/DashboardRevisionPlan';
import { DashboardProgressMoments } from '../../components/parent/dashboard/DashboardProgressMoments';
import { DashboardRecentActivity } from '../../components/parent/dashboard/DashboardRecentActivity';
import { DashboardActiveRewards } from '../../components/parent/dashboard/DashboardActiveRewards';
import { DashboardMessageBanner } from '../../components/parent/dashboard/DashboardMessageBanner';
import AppIcon from '../../components/ui/AppIcon';
import type { BannerMessage } from '../../components/parent/dashboard/DashboardMessageBanner';

const DashboardInviteModal = lazy(
  () => import('../../components/parent/dashboard/DashboardInviteModal')
);

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-content mx-auto px-6 py-8">
        <div className="h-8 bg-border rounded w-40 mb-4 animate-pulse" />
        <div className="bg-background rounded-2xl shadow-sm p-8 animate-pulse mb-8">
          <div className="h-8 bg-primary/10 rounded w-1/3 mb-4" />
          <div className="h-4 bg-primary/10 rounded w-2/3 mb-8" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-secondary rounded-xl" />
            <div className="h-24 bg-secondary rounded-xl" />
            <div className="h-24 bg-secondary rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="h-64 bg-background rounded-2xl shadow-sm animate-pulse" />
          <div className="h-64 bg-background rounded-2xl shadow-sm animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-center">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <AppIcon name="triangle-alert" className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">Something went wrong</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
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
    dailyPattern: _dailyPattern,
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

  // Derive banner message from first child reminder (placeholder logic)
  const bannerMessage = useMemo((): BannerMessage | null => {
    if (childReminders.length === 0) return null;
    const reminder = childReminders[0];
    return {
      variant: 'nudge',
      icon: 'lightbulb',
      title: reminder.message,
      detail: reminder.status_detail ?? undefined,
    };
  }, [childReminders]);

  const [showInviteModal, setShowInviteModal] = useState(false);

  // Navigation helpers
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
        // No-op — plan stays as-is
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

  // Loading state
  if (loading) return <DashboardSkeleton />;

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="max-w-content mx-auto px-6 py-8">
          <ErrorState message={error} onRetry={refresh} />
        </div>
      </div>
    );
  }

  // No data state
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
      <main className="max-w-content mx-auto px-4 py-4 lg:px-6 lg:py-5">
        {/* Page Header: title + message banner */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <DashboardMessageBanner message={bannerMessage} />
        </div>

        {/* Row 1: Hero (2/3) + Health Score (1/3) — stacks on mobile */}
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

        {/* Row 2: Revision Plan — full width */}
        <div className="mb-4">
          <DashboardRevisionPlan
            planOverview={planOverview}
            loading={planOverviewLoading}
            onEditSchedule={handleEditSchedule}
          />
        </div>

        {/* Row 3: Recent Activity + Progress Moments + Active Rewards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardRecentActivity
            comingUp={childComingUp}
            coverage={childCoverage}
          />
          <DashboardProgressMoments moments={childMoments} />
          <DashboardActiveRewards
            rewards={enabledRewards}
            loading={rewardsLoading}
            onConfigureRewards={handleConfigureRewards}
          />
        </div>

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
    </div>
  );
}

export function ParentDashboardV3() {
  return <ParentDashboardV3Inner />;
}

export default ParentDashboardV3;
