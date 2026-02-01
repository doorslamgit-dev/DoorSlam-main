// src/components/parent/rewards/RewardHeroHeader.tsx
// FEAT-013: Hero header with title, child selector, and stats

interface ChildInfo {
  id: string;
  first_name: string;
  preferred_name: string;
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
        <h1 className="text-2xl font-bold text-gray-900">
          {childName}'s Rewards
        </h1>
        <p className="text-gray-600 mt-1">
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
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
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