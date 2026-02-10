// src/views/parent/ParentDashboardV3.tsx
// Parent Dashboard v3 — Child-specific dashboard with hero, health score, revision plan, activity

'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useChildDashboardData } from '../../hooks/parent/useChildDashboardData';
import { DashboardChildHeader } from '../../components/parent/dashboard/DashboardChildHeader';
import { DashboardHeroCard } from '../../components/parent/dashboard/DashboardHeroCard';
import { HealthScoreCard } from '../../components/parent/dashboard/HealthScoreCard';
import { DashboardRevisionPlan } from '../../components/parent/dashboard/DashboardRevisionPlan';
import { DashboardProgressMoments } from '../../components/parent/dashboard/DashboardProgressMoments';
import { DashboardRecentActivity } from '../../components/parent/dashboard/DashboardRecentActivity';
import { DashboardActiveRewards } from '../../components/parent/dashboard/DashboardActiveRewards';
import AppIcon from '../../components/ui/AppIcon';

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50">
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
  const router = useRouter();

  const {
    data,
    selectedChild,
    selectedChildId,
    setSelectedChildId,
    dailyPattern,
    childComingUp,
    childCoverage,
    childMoments,
    planOverview,
    planOverviewLoading,
    enabledRewards,
    rewardsLoading,
    loading,
    error,
    refresh,
  } = useChildDashboardData({ enableRealtime: true, enableVisibilityRefresh: true });

  // Navigation helpers
  const navigateWithScroll = (path: string) => {
    router.push(path);
    window.scrollTo({ top: 0, behavior: 'instant' });
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
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-content mx-auto px-6 py-8">
          <ErrorState message={error} onRetry={refresh} />
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-content mx-auto px-6 py-8">
          <ErrorState message="No data available" onRetry={refresh} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="max-w-content mx-auto px-4 py-4 lg:px-6 lg:py-5">
        {/* Page Header: Dashboard title + child selector */}
        <DashboardChildHeader
          child={selectedChild}
          children={data.children}
          onChildChange={setSelectedChildId}
        />

        {/* Row 1: Hero (2/3) + Health Score (1/3) — stacks on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2">
            <DashboardHeroCard
              child={selectedChild}
              dailyPattern={dailyPattern}
              childCoverage={childCoverage}
              onActionClick={handleActionClick}
              onViewDetailedBreakdown={handleViewDetailedBreakdown}
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
            comingUp={childComingUp}
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
      </main>
    </div>
  );
}

// Wrap with Suspense for useSearchParams
export function ParentDashboardV3() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ParentDashboardV3Inner />
    </Suspense>
  );
}

export default ParentDashboardV3;
