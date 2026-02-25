// src/components/child/completestep/CelebrationBanner.tsx

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";
import { GamificationResult } from "../../../types/child/completestep";

interface CelebrationBannerProps {
  childName: string;
  gamification: GamificationResult;
}

export function CelebrationBanner({
  childName,
  gamification,
}: CelebrationBannerProps) {
  const fireIcon: IconKey = "fire";
  const trophyIcon: IconKey = "trophy";

  return (
    <div className="bg-gradient-to-br from-primary/5 via-primary/5 to-primary/5 rounded-2xl shadow-sm p-8 text-center border border-primary/20">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <AppIcon name="party-popper" className="w-10 h-10 text-primary" aria-hidden />
      </div>

      <h2 className="text-3xl font-bold text-foreground mb-2">
        You did it, {childName}!
      </h2>

      <p className="text-muted-foreground text-lg mb-6">
        Another session complete – you're on fire!
      </p>

      {/* Stats Row */}
      <div className="flex items-center justify-center gap-4">
        {/* XP Earned */}
        <div className="bg-background rounded-xl p-4 shadow-sm min-w-[100px]">
          <div className="text-2xl font-bold text-primary">
            +{gamification.xpEarned}
          </div>
          <div className="text-xs text-muted-foreground mt-1">XP earned</div>
        </div>

        {/* Streak */}
        <div className="bg-background rounded-xl p-4 shadow-sm min-w-[100px]">
          <div className="flex items-center justify-center gap-1">
            <AppIcon
              name={fireIcon}
              className="text-warning"
              aria-hidden
            />
            <span className="text-2xl font-bold text-foreground">
              {gamification.currentStreak}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">day streak</div>
        </div>

        {/* Badge (if earned) */}
        {gamification.newBadge && (
          <div className="bg-background rounded-xl p-4 shadow-sm min-w-[100px]">
            <AppIcon
              name={trophyIcon}
              className="text-warning text-2xl mx-auto"
              aria-hidden
            />
            <div className="text-xs text-muted-foreground mt-1">New badge!</div>
          </div>
        )}
      </div>
    </div>
  );
}
