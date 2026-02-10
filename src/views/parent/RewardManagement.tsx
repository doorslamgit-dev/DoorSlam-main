// src/views/parent/RewardManagement.tsx
// FEAT-013: Reward Management - Orchestrator Page
// Composes components from src/components/parent/rewards/
// Uses hooks from src/hooks/parent/rewards/

import { useState, useEffect } from 'react';
import AppIcon from '../../components/ui/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { fetchParentChildren } from '../../services/parent/insightsDashboardService';

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

interface ChildInfo {
  id: string;
  first_name: string;
  preferred_name: string | null;
}

export function RewardManagement() {
  const { user } = useAuth();

  // Local state for children
  const [childList, setChildList] = useState<ChildInfo[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [childrenLoading, setChildrenLoading] = useState(true);

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

  // Fetch children on mount
  useEffect(() => {
    if (!user) {
      setChildrenLoading(false);
      return;
    }

    async function loadChildren() {
      const { data, error } = await fetchParentChildren(user!.id);

      if (!error && data) {
        setChildList(data);
        if (data.length > 0 && !selectedChildId) {
          setSelectedChildId(data[0].id);
        }
      }
      setChildrenLoading(false);
    }

    loadChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load children once when user changes
  }, [user]);

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
  if (childrenLoading || templatesLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <AppIcon name="loader" className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Error Banner */}
      {error && (
        <div className="bg-danger-bg border-b border-danger-border px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <p className="text-danger">{error}</p>
            <button 
              onClick={clearError}
              className="text-danger hover:text-danger p-1"
            >
              <AppIcon name="x" className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Header */}
        <section className="bg-gradient-to-br from-primary-50 via-primary-100/50 to-white rounded-2xl shadow-sm p-6 border border-primary-200/30">
          <RewardHeroHeader
            childList={childList}
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