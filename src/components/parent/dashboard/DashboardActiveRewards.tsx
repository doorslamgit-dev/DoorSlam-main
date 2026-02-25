// src/components/parent/dashboard/DashboardActiveRewards.tsx
// Compact active rewards card for dashboard context


import AppIcon from '../../ui/AppIcon';
import Button from '../../ui/Button';
import EmptyState from '../../ui/EmptyState';
import type { IconKey } from '../../ui/AppIcon';
import type { EnabledReward, CategoryCode } from '../../../types/parent/rewardTypes';

interface DashboardActiveRewardsProps {
  rewards: EnabledReward[];
  loading: boolean;
  onConfigureRewards: () => void;
}

const categoryIcons: Record<string, IconKey> = {
  screen_time: 'monitor',
  treats: 'candy',
  activities: 'ticket',
  pocket_money: 'wallet',
  privileges: 'crown',
  custom: 'gift',
};

const categoryColors: Record<string, string> = {
  screen_time: '#3B82F6',
  treats: '#F59E0B',
  activities: '#10B981',
  pocket_money: '#8B5CF6',
  privileges: '#EC4899',
  custom: '#6B7280',
};

function getCategoryIcon(code: CategoryCode | string): IconKey {
  return categoryIcons[code] || 'gift';
}

function getCategoryColor(code: CategoryCode | string): string {
  return categoryColors[code] || '#6B7280';
}

export function DashboardActiveRewards({
  rewards,
  loading,
  onConfigureRewards,
}: DashboardActiveRewardsProps) {
  if (loading) {
    return (
      <div className="bg-neutral-0 rounded-2xl shadow-card p-4 border border-default animate-pulse">
        <div className="h-5 bg-neutral-200 rounded w-28 mb-3" />
        <div className="h-16 bg-neutral-100 rounded-xl" />
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="bg-neutral-0 rounded-2xl shadow-card p-4 border border-default">
        <h3 className="text-sm font-bold text-dark mb-3">Active Rewards</h3>
        <EmptyState
          variant="minimal"
          icon="gift"
          title="No rewards set up yet"
          iconColor="text-primary-500"
        />
        <div className="mt-3 flex justify-center">
          <Button variant="primary" size="sm" onClick={onConfigureRewards}>
            Set Up Rewards
          </Button>
        </div>
      </div>
    );
  }

  const count = Math.min(rewards.length, 4);
  return (
    <div className="bg-neutral-0 rounded-2xl shadow-card p-4 border border-default">
      <h3 className="text-sm font-bold text-dark">Active Rewards</h3>
      <p className="text-xs text-muted mb-3">
        {count} reward{count !== 1 ? 's' : ''} your child can work towards
      </p>
      <div className="space-y-2">
        {rewards.slice(0, 4).map((reward) => {
          const color = getCategoryColor(reward.category_code);
          return (
            <div key={reward.id} className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}20` }}
              >
                <AppIcon
                  name={getCategoryIcon(reward.category_code)}
                  className="w-3.5 h-3.5"
                  style={{ color }}
                />
              </div>
              <span className="text-xs font-medium text-medium flex-1 min-w-0 truncate">
                {reward.name}
              </span>
              <span className="text-[10px] font-semibold text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded shrink-0">
                {reward.points_cost} pts
              </span>
              <button
                onClick={onConfigureRewards}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-neutral-100 transition-colors shrink-0"
                aria-label={`Edit ${reward.name}`}
              >
                <AppIcon name="pencil" className="w-3 h-3 text-neutral-400" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardActiveRewards;
