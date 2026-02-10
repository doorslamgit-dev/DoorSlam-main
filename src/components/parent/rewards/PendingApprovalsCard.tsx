// src/components/parent/rewards/PendingApprovalsCard.tsx
// FEAT-013: Combined pending redemptions and addition requests

import { useState } from 'react';
import AppIcon from '../../ui/AppIcon';
import type { PendingRedemption, AdditionRequest } from '../../../types/parent/rewardTypes';

// Helper for time ago
function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

interface PendingApprovalsCardProps {
  redemptions: PendingRedemption[];
  additions: AdditionRequest[];
  onApproveRedemption: (id: string) => Promise<boolean>;
  onDeclineRedemption: (id: string, reason?: string) => Promise<boolean>;
  onApproveAddition: (id: string, pointsCost?: number) => Promise<boolean>;
  onDeclineAddition: (id: string, note?: string) => Promise<boolean>;
  processingRedemption: string | null;
  processingAddition: string | null;
}

export function PendingApprovalsCard({
  redemptions,
  additions,
  onApproveRedemption,
  onDeclineRedemption,
  onApproveAddition,
  onDeclineAddition,
  processingRedemption,
  processingAddition,
}: PendingApprovalsCardProps) {
  const [editingAddition, setEditingAddition] = useState<{ id: string; points: number } | null>(null);

  const totalPending = redemptions.length + additions.length;

  if (totalPending === 0) {
    return null;
  }

  return (
    <div className="bg-neutral-0 rounded-xl border border-warning-border p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-warning-bg">
          <AppIcon name="clock" className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h2 className="font-semibold text-neutral-900">Pending Approval</h2>
          <p className="text-sm text-neutral-500">
            {totalPending} request{totalPending !== 1 ? 's' : ''} waiting for your decision
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Redemption Requests */}
        {redemptions.map((redemption) => {
          const isProcessing = processingRedemption === redemption.id;
          
          return (
            <div
              key={redemption.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-warning-bg rounded-lg border border-amber-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-warning-bg flex items-center justify-center">
                  <AppIcon name="gift" className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">
                    {redemption.child_name} wants to redeem
                  </p>
                  <p className="text-sm text-neutral-600">
                    <span className="font-medium">{redemption.reward_name}</span>
                    <span className="text-neutral-400"> • {redemption.points_spent} pts • {timeAgo(redemption.requested_at)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:ml-auto">
                <button
                  onClick={() => onApproveRedemption(redemption.id)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-success hover:bg-success rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isProcessing ? (
                    <AppIcon name="loader" className="w-4 h-4 animate-spin" />
                  ) : (
                    <AppIcon name="check" className="w-4 h-4" />
                  )}
                  Approve
                </button>
                <button
                  onClick={() => onDeclineRedemption(redemption.id)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-danger hover:bg-danger-bg rounded-lg transition-colors disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            </div>
          );
        })}

        {/* Addition Requests */}
        {additions.map((addition) => {
          const isProcessing = processingAddition === addition.id;
          const isEditing = editingAddition?.id === addition.id;
          
          return (
            <div
              key={addition.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-primary-50 rounded-lg border border-primary-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                  <AppIcon name="plus-circle" className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">
                    {addition.child_name} requests a new reward
                  </p>
                  <p className="text-sm text-neutral-600">
                    <span className="font-medium">{addition.template_name}</span>
                    <span className="text-neutral-400"> • {addition.category_name} • {timeAgo(addition.requested_at)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:ml-auto">
                {isEditing ? (
                  <>
                    <input
                      type="number"
                      value={editingAddition.points}
                      onChange={(e) => setEditingAddition({ 
                        ...editingAddition, 
                        points: parseInt(e.target.value) || 0 
                      })}
                      className="w-20 px-2 py-1 text-sm border border-neutral-300 rounded-lg"
                      min={1}
                    />
                    <span className="text-sm text-neutral-500">pts</span>
                    <button
                      onClick={async () => {
                        await onApproveAddition(addition.id, editingAddition.points);
                        setEditingAddition(null);
                      }}
                      disabled={isProcessing}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-success hover:bg-success rounded-lg transition-colors disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setEditingAddition(null)}
                      className="px-2 py-1.5 text-sm text-neutral-500 hover:text-neutral-700"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-neutral-500">{addition.suggested_points} pts</span>
                    <button
                      onClick={() => setEditingAddition({ id: addition.id, points: addition.suggested_points })}
                      disabled={isProcessing}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isProcessing ? (
                        <AppIcon name="loader" className="w-4 h-4 animate-spin" />
                      ) : (
                        <AppIcon name="plus" className="w-4 h-4" />
                      )}
                      Add Reward
                    </button>
                    <button
                      onClick={() => onDeclineAddition(addition.id)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-danger hover:bg-danger-bg rounded-lg transition-colors disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}