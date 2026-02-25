// src/components/parent/rewards/RewardHeroHeader.tsx
// FEAT-013: Hero header with title, child selector, and stats

interface ChildInfo {
  id: string;
  first_name: string;
  preferred_name: string | null;
}

interface RewardHeroHeaderProps {
  childList: ChildInfo[];
  selectedChildId: string | null;
  onSelectChild: (childId: string) => void;
  enabledCount: number;
}

export function RewardHeroHeader({
  childList,
  selectedChildId,
  onSelectChild,
  enabledCount,
}: RewardHeroHeaderProps) {
  const selectedChild = childList.find(c => c.id === selectedChildId);
  const childName = selectedChild?.preferred_name || selectedChild?.first_name || 'Child';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {childName}'s Rewards
        </h1>
        <p className="text-muted-foreground mt-1">
          {enabledCount === 0 
            ? 'No rewards set up yet' 
            : `${enabledCount} reward${enabledCount !== 1 ? 's' : ''} active`
          }
        </p>
      </div>
      
      {/* Child Selector */}
      {childList.length > 1 && (
        <div className="flex gap-1">
          {childList.map((child) => (
            <button
              key={child.id}
              onClick={() => onSelectChild(child.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedChildId === child.id
                  ? 'bg-primary text-white'
                  : 'bg-background text-foreground hover:bg-muted border border-border'
              }`}
            >
              {child.preferred_name || child.first_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}