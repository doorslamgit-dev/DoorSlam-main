// src/components/parent/rewards/PendingRedemptions.tsx
// FEAT-013: Pending Redemptions Approval Queue

import React, { useState } from 'react';
import AppIcon from '../../ui/AppIcon';
import type { PendingRedemption } from '../../../types/parent/rewardTypes';

interface PendingRedemptionsProps {
  redemptions: PendingRedemption[];
  onApprove: (redemptionId: string) => void;
  onDecline: (redemptionId: string, reason?: string) => void;
  isProcessing: string | null;
}

export function PendingRedemptions({
  redemptions,
  onApprove,
  onDecline,
  isProcessing,
}: PendingRedemptionsProps) {
  const [declineReasonId, setDeclineReasonId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getExpiresIn = (expiresAt: string): string => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diffMs = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Expiring soon';
    if (diffDays === 1) return 'Expires tomorrow';
    return `Expires in ${diffDays} days`;
  };

  const handleDeclineClick = (redemptionId: string) => {
    if (declineReasonId === redemptionId) {
      // Submit decline
      onDecline(redemptionId, declineReason || undefined);
      setDeclineReasonId(null);
      setDeclineReason('');
    } else {
      // Show reason input
      setDeclineReasonId(redemptionId);
      setDeclineReason('');
    }
  };

  if (redemptions.length === 0) {
    return (
      <div className="bg-neutral-0 rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Pending Approvals
        </h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-success-bg flex items-center justify-center">
            <AppIcon name="check" className="w-6 h-6 text-success" />
          </div>
          <p className="text-neutral-600">No pending requests</p>
          <p className="text-sm text-neutral-500">
            When your child requests a reward, it will appear here for your approval.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-0 rounded-xl border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900">
          Pending Approvals
        </h3>
        <span className="bg-warning-bg text-warning text-sm font-medium px-3 py-1 rounded-full">
          {redemptions.length} waiting
        </span>
      </div>

      <div className="space-y-3">
        {redemptions.map((redemption) => (
          <div
            key={redemption.id}
            className="border border-neutral-200 rounded-lg p-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-neutral-900">
                    {redemption.child_name}
                  </span>
                  <span className="text-neutral-400">•</span>
                  <span className="text-sm text-neutral-500">
                    {formatTimeAgo(redemption.requested_at)}
                  </span>
                </div>
                <p className="text-lg font-semibold text-neutral-900 truncate">
                  {redemption.reward_name}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
                  <span className="text-primary-600 font-medium">
                    {redemption.points_cost} points
                  </span>
                  <span className="text-neutral-500">
                    Balance: {redemption.child_current_balance} pts
                  </span>
                  <span className="text-warning flex items-center gap-1">
                    <AppIcon name="clock" className="w-3.5 h-3.5" />
                    {getExpiresIn(redemption.expires_at)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {isProcessing === redemption.id ? (
                  <span className="text-neutral-500 flex items-center gap-2">
                    <AppIcon name="loader" className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => onApprove(redemption.id)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-success text-white rounded-lg hover:bg-success transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <AppIcon name="check" className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleDeclineClick(redemption.id)}
                      className="flex-1 sm:flex-none px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium"
                    >
                      {declineReasonId === redemption.id ? 'Confirm' : 'Decline'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Decline reason input */}
            {declineReasonId === redemption.id && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Reason (optional)"
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={() => {
                    setDeclineReasonId(null);
                    setDeclineReason('');
                  }}
                  className="px-3 py-2 text-sm text-neutral-500 hover:text-neutral-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PendingRedemptions;