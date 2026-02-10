// src/components/child/rewards/RedemptionModal.tsx
// FEAT-013 Phase 3: Reward redemption confirmation modal
// Success states now handled by RewardToast

import React from 'react';
import AppIcon from '../../ui/AppIcon';
import type { CatalogReward } from '../../../types/child/childRewardTypes';

interface RedemptionModalProps {
  reward: CatalogReward;
  pointsBalance: number;
  isRequesting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function RedemptionModal({
  reward,
  pointsBalance,
  isRequesting,
  onConfirm,
  onClose,
}: RedemptionModalProps) {
  const pointsAfter = pointsBalance - reward.points_cost;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-neutral-0 rounded-t-3xl sm:rounded-3xl shadow-xl w-full sm:max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Reward display */}
        <div className="text-center mb-6">
          <span className="text-5xl mb-3 block">{reward.emoji}</span>
          <h2 className="text-xl font-bold text-neutral-900 mb-1">
            {reward.name}
          </h2>
          <p className="text-warning font-semibold">
            {reward.points_cost} points
          </p>
        </div>

        {/* Points breakdown */}
        <div className="bg-neutral-50 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Your points</span>
            <span className="font-medium text-neutral-900">{pointsBalance}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">This reward</span>
            <span className="font-medium text-danger">-{reward.points_cost}</span>
          </div>
          <div className="border-t border-neutral-200 pt-2 flex justify-between">
            <span className="text-neutral-600 font-medium">After</span>
            <span className="font-bold text-neutral-900">{pointsAfter} points</span>
          </div>
        </div>

        {/* Limit warning if applicable */}
        {reward.limit_type && reward.limit_count && (
          <div className="bg-warning-bg rounded-lg p-3 mb-4 flex items-start gap-2">
            <AppIcon name="info" className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <p className="text-xs text-warning">
              You can get this reward {reward.limit_count} time{reward.limit_count > 1 ? 's' : ''} per{' '}
              {reward.limit_type.replace('per_', '')}.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onConfirm}
            disabled={isRequesting}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isRequesting ? (
              <>
                <AppIcon name="loader" className="w-5 h-5 animate-spin" />
                Requesting...
              </>
            ) : (
              <>
                <AppIcon name="gift" className="w-5 h-5" />
                Request This Reward
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            disabled={isRequesting}
            className="w-full py-3 text-neutral-600 hover:text-neutral-800 font-medium transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default RedemptionModal;