// src/components/gamification/StreakCounter.tsx
// FEAT-010: AppIcon + no emoji icons for UI + theme-ready classes (no hard-coded hex)

import AppIcon from "../ui/AppIcon";
import {
  getStreakMessage,
  getStreakColorScheme,
} from "../../services/gamificationService";

type StreakCounterProps = {
  currentStreak: number;
  longestStreak?: number;
  size?: "sm" | "md" | "lg";
  showMessage?: boolean;
  animated?: boolean;
};

export default function StreakCounter({
  currentStreak,
  longestStreak,
  size = "md",
  showMessage = false,
  animated = false,
}: StreakCounterProps) {
  const colors = getStreakColorScheme(currentStreak);
  const message = getStreakMessage(currentStreak);

  const sizeClasses = {
    sm: {
      container: "px-3 py-1.5",
      icon: "w-4 h-4",
      number: "text-sm",
      message: "text-xs",
    },
    md: {
      container: "px-4 py-2",
      icon: "w-5 h-5",
      number: "text-base",
      message: "text-xs",
    },
    lg: {
      container: "px-5 py-3",
      icon: "w-6 h-6",
      number: "text-xl",
      message: "text-sm",
    },
  } as const;

  const classes = sizeClasses[size];

  return (
    <div
      className={`inline-flex items-center gap-2 ${colors.bg} border border-orange-200 rounded-xl ${classes.container}`}
    >
      {/* Flame icon */}
      <AppIcon
        name="flame"
        className={`${classes.icon} text-orange-600 ${
          animated && currentStreak > 0 ? "animate-pulse" : ""
        }`}
        aria-hidden
      />

      {/* Streak info */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className={`font-bold ${colors.text} ${classes.number}`}>
            {currentStreak}
          </span>
          <span className={`text-orange-600 ${classes.message}`}>
            {currentStreak === 1 ? "day" : "days"}
          </span>
        </div>

        {showMessage && (
          <span className={`${colors.text} opacity-80 ${classes.message}`}>
            {message}
          </span>
        )}
      </div>

      {/* Best streak badge */}
      {longestStreak !== undefined && longestStreak > currentStreak && (
        <div className="ml-2 pl-2 border-l border-orange-200">
          <div className="text-xs text-orange-600">Best: {longestStreak}</div>
        </div>
      )}
    </div>
  );
}

// Compact badge version
export function StreakBadge({ streak }: { streak: number }) {
  const colors = getStreakColorScheme(streak);

  if (streak === 0) return null;

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 ${colors.bg} rounded-full`}
    >
      <AppIcon name="flame" className="w-3.5 h-3.5 text-orange-600" aria-hidden />
      <span className={`text-xs font-semibold ${colors.text}`}>{streak}</span>
    </div>
  );
}

// Large celebration version
export function StreakCelebration({
  streak,
  isNewRecord,
}: {
  streak: number;
  isNewRecord?: boolean;
}) {
  return (
    <div className="text-center py-6">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center animate-bounce">
          <AppIcon name="flame" className="w-10 h-10 text-orange-600" aria-hidden />
        </div>
      </div>

      <div className="text-4xl font-bold text-orange-600 mb-2">
        {streak} Day Streak!
      </div>

      {isNewRecord && (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full">
          <AppIcon name="party-popper" className="w-5 h-5 text-orange-700" aria-hidden />
          <span className="font-semibold text-orange-700">New Personal Best!</span>
        </div>
      )}

      <p className="mt-4 text-muted-foreground">{getStreakMessage(streak)}</p>
    </div>
  );
}
