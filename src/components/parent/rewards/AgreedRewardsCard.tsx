// src/components/parent/rewards/AgreedRewardsCard.tsx
// FEAT-013: Card showing all enabled/agreed rewards

import AppIcon from '../../ui/AppIcon';
import { RewardTemplateCard } from './RewardTemplateCard';
import type { EnabledReward } from '../../../types/parent/rewardTypes';

interface AgreedRewardsCardProps {
  rewards: EnabledReward[];
  onUpdatePoints: (rewardId: string, points: number) => void;
}

export function AgreedRewardsCard({ rewards, onUpdatePoints }: AgreedRewardsCardProps) {
  if (rewards.length === 0) {
    return null;
  }

  return (
    <div className="bg-neutral-0 rounded-xl border border-neutral-200 p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-success-bg">
          <AppIcon name="check-circle" className="w-5 h-5 text-success" />
        </div>
        <div>
          <h2 className="font-semibold text-neutral-900">Active Rewards</h2>
          <p className="text-sm text-neutral-500">
            {rewards.length} reward{rewards.length !== 1 ? 's' : ''} your child can work towards
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {rewards.map((reward) => (
          <RewardTemplateCard
            key={reward.id}
            id={reward.template_id}
            name={reward.name}
            pointsCost={reward.points_cost}
            categoryCode={reward.category_code}
            isEnabled={true}
            childRewardId={reward.id}
            onUpdatePoints={onUpdatePoints}
            showToggle={false}
            showEditPoints={true}
            compact={true}
          />
        ))}
      </div>
    </div>
  );
}