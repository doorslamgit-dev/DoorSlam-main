// src/components/child/today/StreakMomentumCard.tsx
// FEAT-013: Streak momentum card (half-width, sits alongside RewardsMiniCard)
// Extracted from inline Today.tsx implementation

import AppIcon from "../../ui/AppIcon";

interface StreakMomentumCardProps {
  currentStreak: number;
  completedToday: number;
  totalToday: number;
}

export default function StreakMomentumCard({
  currentStreak,
  completedToday,
  totalToday,
}: StreakMomentumCardProps) {
  const allComplete = completedToday >= totalToday && totalToday > 0;

  // Don't render if no streak
  if (currentStreak === 0) {
    return (
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
            <AppIcon name="flame" className="text-primary w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-2">
              Build Your Streak
            </h3>
            <p className="text-muted-foreground">
              Complete today's sessions to start a streak!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const streakLabel = currentStreak >= 7 ? "incredible!" : "great momentum!";

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl shadow-soft p-6 border border-primary/20">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center flex-shrink-0">
          <AppIcon name="flame" className="text-white w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground mb-2">
            {currentStreak}-day streak — {streakLabel}
          </h3>
          <p className="text-muted-foreground mb-3">
            {allComplete
              ? "Amazing work! You've completed all your sessions today. Keep it up tomorrow!"
              : `You're building an amazing habit. Complete today's sessions to reach a ${currentStreak + 1}-day streak!`}
          </p>
          <StreakVisualizer current={currentStreak} showNext={!allComplete} />
        </div>
      </div>
    </div>
  );
}

/**
 * Streak Visualizer - shows streak progress circles
 */
function StreakVisualizer({ current, showNext }: { current: number; showNext: boolean }) {
  // Show up to 4 completed circles + 1 next if applicable
  const displayCount = Math.min(current, 4);

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: displayCount }).map((_, i) => (
        <div
          key={i}
          className="w-8 h-8 bg-success rounded-full flex items-center justify-center"
        >
          <AppIcon name="check" className="text-white w-3 h-3" />
        </div>
      ))}
      {showNext && (
        <div className="w-8 h-8 bg-primary/30 rounded-full flex items-center justify-center border-2 border-primary">
          <span className="text-foreground font-bold text-xs">{current + 1}</span>
        </div>
      )}
    </div>
  );
}