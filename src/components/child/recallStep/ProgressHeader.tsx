// src/components/child/recallStep/ProgressHeader.tsx
// Learning/Known counters and progress bar

type ProgressHeaderProps = {
  learningCount: number;
  knownCount: number;
  currentIndex: number;
  totalCards: number;
};

export function ProgressHeader({
  learningCount,
  knownCount,
  currentIndex,
  totalCards,
}: ProgressHeaderProps) {
  const progressPercent = totalCards > 0 ? (currentIndex / totalCards) * 100 : 0;

  return (
    <div className="bg-neutral-0 rounded-2xl shadow-card p-4">
      <div className="flex items-center justify-between">
        {/* Still learning counter */}
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-warning-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {learningCount}
          </span>
          <span className="text-warning-600 font-medium text-sm">
            To learn
          </span>
        </div>

        {/* Card position */}
        <span className="text-neutral-500 text-sm font-medium">
          {currentIndex + 1}/{totalCards}
        </span>

        {/* Known counter */}
        <div className="flex items-center gap-2">
          <span className="text-success-600 font-medium text-sm">
            Got it
          </span>
          <span className="w-6 h-6 bg-success-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {knownCount}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 w-full bg-neutral-200 rounded-full h-1">
        <div
          className="bg-primary-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
