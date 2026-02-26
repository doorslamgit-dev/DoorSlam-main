

// src/components/child/today/RewardsMiniCard.tsx
// FEAT-013 Phase 3: Rewards mini card for child dashboard
// Designed to sit side-by-side with StreakMomentumCard

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppIcon from '../../ui/AppIcon';
import { supabase } from '../../../lib/supabase';

interface RewardsSummary {
  points_balance: number;
  unlocked_count: number;
  pending_count: number;
  next_goal: {
    name: string;
    emoji: string;
    points_cost: number;
    points_needed: number;
    progress_percent: number;
  } | null;
  has_rewards: boolean;
}

interface RewardsMiniCardProps {
  childId: string;
}

export default function RewardsMiniCard({ childId }: RewardsMiniCardProps) {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<RewardsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      if (!childId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('rpc_get_child_rewards_summary', {
          p_child_id: childId,
        });

        if (error) throw error;
        setSummary(data as RewardsSummary);
      } catch (err) {
        console.error('Error fetching rewards summary:', err);
        // Silent fail - card just won't show
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [childId]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-warning/10 to-warning/10 rounded-2xl p-6 border border-warning/20 flex items-center justify-center min-h-[180px]">
        <AppIcon name="loader" className="w-6 h-6 text-warning animate-spin" />
      </div>
    );
  }

  // No rewards configured - show placeholder
  if (!summary || !summary.has_rewards) {
    return (
      <div className="bg-gradient-to-br from-muted to-secondary rounded-2xl p-6 border border-border flex flex-col justify-center min-h-[180px]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-border flex items-center justify-center">
            <AppIcon name="gift" className="w-5 h-5 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-muted-foreground">Rewards</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Ask your parent to set up some rewards for you!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-warning/10 to-warning/10 rounded-2xl p-6 border border-warning/20">
      {/* Header with points */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
            <AppIcon name="star" className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-primary text-sm">My Points</h3>
            <p className="text-2xl font-bold text-warning">{summary.points_balance}</p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex flex-col items-end gap-1">
          {summary.unlocked_count > 0 && (
            <span className="bg-success/10 text-success px-2 py-0.5 rounded-full text-xs font-medium">
              {summary.unlocked_count} ready!
            </span>
          )}
          {summary.pending_count > 0 && (
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
              <AppIcon name="clock" className="w-3 h-3" />
              {summary.pending_count} pending
            </span>
          )}
        </div>
      </div>

      {/* Next goal progress */}
      {summary.next_goal && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Next:</span>
            <span className="font-medium text-primary truncate ml-2">
              {summary.next_goal.emoji} {summary.next_goal.name}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-white/70 rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-gradient-to-r from-warning to-warning/90 rounded-full transition-all duration-500"
              style={{ width: `${summary.next_goal.progress_percent}%` }}
            />
          </div>

          <p className="text-xs text-muted-foreground text-right">
            {summary.next_goal.points_needed} pts to go
          </p>
        </div>
      )}

      {/* No next goal - show unlocked message or encouragement */}
      {!summary.next_goal && (
        <div className="mb-4">
          {summary.unlocked_count > 0 ? (
            <p className="text-sm text-success font-medium flex items-center gap-1.5">
              <AppIcon name="party-popper" className="w-4 h-4 flex-shrink-0" aria-hidden />
              {summary.unlocked_count} reward{summary.unlocked_count !== 1 ? 's' : ''} ready to claim!
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete sessions to earn more points!
            </p>
          )}
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={() => navigate('/child/rewards')}
        className="w-full py-2.5 bg-warning hover:bg-warning/90 text-primary-foreground rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
      >
        <AppIcon name="gift" className="w-4 h-4" />
        {summary.unlocked_count > 0 ? 'Claim Rewards' : 'View Rewards'}
      </button>
    </div>
  );
}