// src/views/parent/RewardManagement.tsx
// FEAT-013: Reward Management - Orchestrator Page
// Composes components from src/components/parent/rewards/
// Uses hooks from src/hooks/parent/rewards/

import AppIcon from '../../components/ui/AppIcon';
import { useSelectedChild } from '../../contexts/SelectedChildContext';
import { PageChildHeader, NotificationBanner } from '../../components/layout';
import { useParentDashboardData } from '../../hooks/parent/useParentDashboardData';

// Components
import {
  RewardHeroHeader,
  AgreedRewardsCard,
  PendingApprovalsCard,
  RewardCatalogSection,
  QuickStartBanner,
} from '../../components/parent/rewards';

// Hooks
import {
  useRewardTemplates,
  usePendingApprovals,
  useRewardActions,
} from '../../hooks/parent/rewards';

export function RewardManagement() {
  const { children: childOptions, selectedChildId, setSelectedChildId } = useSelectedChild();

  // Lightweight child status fetch for notification banner
  const { data: parentData } = useParentDashboardData({ enableRealtime: false, enableVisibilityRefresh: false });
  const selectedChildSummary = parentData?.children.find(c => c.child_id === selectedChildId) || null;
  const showNotificationBanner =
    selectedChildSummary?.status_indicator === 'needs_attention' ||
    selectedChildSummary?.status_indicator === 'keep_an_eye';
  const notificationMessage =
    selectedChildSummary?.status_detail || selectedChildSummary?.insight_message || '';

  // Hooks
  const {
    templates,
    enabledRewards,
    enabledCount,
    loading: templatesLoading,
    error: templatesError,
    refresh: refreshTemplates,
  } = useRewardTemplates(selectedChildId);

  const {
    redemptions,
    additions,
    removeRedemption,
    removeAddition,
  } = usePendingApprovals();

  const {
    togglingTemplate,
    quickStarting,
    processingRedemption,
    processingAddition,
    toggleTemplate,
    quickStart,
    updatePoints,
    approveRedemption,
    declineRedemption,
    approveAddition,
    declineAddition,
    error: actionError,
    clearError,
  } = useRewardActions();

  // Handlers that wrap hook actions and refresh data
  const handleToggleTemplate = async (templateId: string, currentEnabled: boolean) => {
    if (!selectedChildId) return;
    const success = await toggleTemplate(selectedChildId, templateId, currentEnabled);
    if (success) {
      refreshTemplates();
    }
  };

  const handleQuickStart = async () => {
    if (!selectedChildId) return;
    const success = await quickStart(selectedChildId);
    if (success) {
      refreshTemplates();
    }
  };

  const handleUpdatePoints = async (rewardId: string, points: number) => {
    const success = await updatePoints(rewardId, points);
    if (success) {
      refreshTemplates();
    }
  };

  const handleApproveRedemption = async (redemptionId: string) => {
    const success = await approveRedemption(redemptionId);
    if (success) {
      removeRedemption(redemptionId);
    }
    return success;
  };

  const handleDeclineRedemption = async (redemptionId: string, reason?: string) => {
    const success = await declineRedemption(redemptionId, reason);
    if (success) {
      removeRedemption(redemptionId);
    }
    return success;
  };

  const handleApproveAddition = async (requestId: string, pointsCost?: number) => {
    const success = await approveAddition(requestId, pointsCost);
    if (success) {
      removeAddition(requestId);
      refreshTemplates();
    }
    return success;
  };

  const handleDeclineAddition = async (requestId: string, note?: string) => {
    const success = await declineAddition(requestId, note);
    if (success) {
      removeAddition(requestId);
    }
    return success;
  };

  // Combined error
  const error = templatesError || actionError;

  // Loading state
  if (templatesLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <AppIcon name="loader" className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Error Banner */}
      {error && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <p className="text-destructive">{error}</p>
            <button
              onClick={clearError}
              className="text-destructive hover:text-destructive p-1"
            >
              <AppIcon name="x" className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Page Header */}
        <PageChildHeader
          title="Rewards"
          subtitle={
            enabledCount === 0
              ? 'No rewards set up yet'
              : `${enabledCount} reward${enabledCount !== 1 ? 's' : ''} active`
          }
          banner={showNotificationBanner ? <NotificationBanner message={notificationMessage} /> : undefined}
        />

        {/* Hero Header */}
        <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-white rounded-2xl shadow-sm p-6 border border-primary/20">
          <RewardHeroHeader
            childList={childOptions.map(c => ({ id: c.child_id, first_name: c.child_name, preferred_name: null }))}
            selectedChildId={selectedChildId}
            onSelectChild={setSelectedChildId}
            enabledCount={enabledCount}
          />

          {/* Quick Start - only show if no rewards enabled */}
          {enabledCount === 0 && (
            <div className="mt-4">
              <QuickStartBanner
                onQuickStart={handleQuickStart}
                loading={quickStarting}
              />
            </div>
          )}
        </section>

        {/* Agreed/Active Rewards */}
        <AgreedRewardsCard
          rewards={enabledRewards}
          onUpdatePoints={handleUpdatePoints}
        />

        {/* Pending Approvals */}
        <PendingApprovalsCard
          redemptions={redemptions}
          additions={additions}
          onApproveRedemption={handleApproveRedemption}
          onDeclineRedemption={handleDeclineRedemption}
          onApproveAddition={handleApproveAddition}
          onDeclineAddition={handleDeclineAddition}
          processingRedemption={processingRedemption}
          processingAddition={processingAddition}
        />

        {/* Reward Catalog */}
        {templates?.categories && (
          <RewardCatalogSection
            categories={templates.categories}
            onToggleTemplate={handleToggleTemplate}
            onUpdatePoints={handleUpdatePoints}
            togglingTemplate={togglingTemplate}
          />
        )}
      </main>
    </div>
  );
}

export default RewardManagement;