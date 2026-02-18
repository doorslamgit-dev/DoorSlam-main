// src/components/parent/dashboard/DashboardActiveRewards.tsx
// Compact active rewards card for dashboard context


import AppIcon from '../../ui/AppIcon';
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
      <div className="bg-neutral-0 rounded-2xl shadow-card p-4 border border-neutral-200/50 animate-pulse">
        <div className="h-5 bg-neutral-200 rounded w-28 mb-3" />
        <div className="h-16 bg-neutral-100 rounded-xl" />
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="bg-neutral-0 rounded-2xl shadow-card p-4 border border-neutral-200/50">
        <h3 className="text-sm font-bold text-neutral-800 mb-3">Active Rewards</h3>
        <div className="text-center py-4">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <AppIcon name="gift" className="w-5 h-5 text-primary-500" />
          </div>
          <p className="text-xs text-neutral-500 mb-2">No rewards set up yet</p>
          <button
            onClick={onConfigureRewards}
            className="px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            Set Up Rewards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-0 rounded-2xl shadow-card p-4 border border-neutral-200/50">
      <h3 className="text-sm font-bold text-neutral-800 mb-3">Active Rewards</h3>
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
              <span className="text-xs font-medium text-neutral-700 flex-1 min-w-0 truncate">
                {reward.name}
              </span>
              <span className="text-[10px] font-semibold text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded shrink-0">
                {reward.points_cost} pts
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardActiveRewards;
