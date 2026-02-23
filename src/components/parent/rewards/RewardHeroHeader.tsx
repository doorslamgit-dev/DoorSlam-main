// src/components/parent/rewards/RewardHeroHeader.tsx
// FEAT-013: Hero header with title and stats

interface RewardHeroHeaderProps {
  childName: string;
  enabledCount: number;
}

export function RewardHeroHeader({
  childName,
  enabledCount,
}: RewardHeroHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">
        {childName}&apos;s Rewards
      </h1>
      <p className="text-neutral-600 mt-1">
        {enabledCount === 0
          ? 'No rewards set up yet'
          : `${enabledCount} reward${enabledCount !== 1 ? 's' : ''} active`
        }
      </p>
    </div>
  );
}