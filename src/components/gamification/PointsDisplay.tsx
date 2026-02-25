// src/components/gamification/PointsDisplay.tsx
// FEAT-010: Theme-ready colours + AppIcon only (no FontAwesome, no hard-coded hex)

import AppIcon from "../ui/AppIcon";
import { getLevelInfo, formatPoints } from "../../services/gamificationService";

type PointsDisplayProps = {
  balance: number;
  lifetime: number;
  showLevel?: boolean;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
};

export default function PointsDisplay({
  balance,
  lifetime,
  showLevel = false,
  size = "md",
  animated = false,
}: PointsDisplayProps) {
  const level = getLevelInfo(lifetime);

  const sizeClasses = {
    sm: {
      container: "px-3 py-1.5",
      icon: "w-4 h-4",
      points: "text-sm",
      label: "text-xs",
    },
    md: {
      container: "px-4 py-2",
      icon: "w-5 h-5",
      points: "text-base",
      label: "text-xs",
    },
    lg: {
      container: "px-5 py-3",
      icon: "w-6 h-6",
      points: "text-xl",
      label: "text-sm",
    },
  } as const;

  const classes = sizeClasses[size];

  return (
    <div
      className={`inline-flex items-center gap-2 bg-warning/10 border border-warning/20 rounded-xl ${classes.container} ${
        animated ? "animate-pulse" : ""
      }`}
    >
      {/* Points marker */}
      <div className={`inline-flex items-center justify-center ${classes.icon}`}>
        <AppIcon
          name="sparkles"
          className={`${classes.icon} text-warning`}
          aria-hidden
        />
      </div>

      {/* Points value */}
      <div className="flex flex-col">
        <span className={`font-bold text-primary ${classes.points}`}>
          {formatPoints(balance)}
        </span>

        {showLevel && (
          <span className={`text-muted-foreground ${classes.label}`}>
            Lv.{level.level} {level.title}
          </span>
        )}
      </div>
    </div>
  );
}

// Compact version for headers
export function PointsBadge({ balance }: { balance: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent-amber/15 border border-accent-amber/20 rounded-full">
      <AppIcon
        name="sparkles"
        className="w-4 h-4 text-warning"
        aria-hidden
      />
      <span className="text-sm font-semibold text-primary">
        {formatPoints(balance)}
      </span>
    </div>
  );
}

// Points gained animation overlay
export function PointsGainedAnimation({
  points,
  onComplete,
}: {
  points: number;
  onComplete?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
      onAnimationEnd={onComplete}
    >
      <div className="animate-bounce-up-fade text-4xl font-bold text-warning drop-shadow-lg">
        +{points}
      </div>
    </div>
  );
}
