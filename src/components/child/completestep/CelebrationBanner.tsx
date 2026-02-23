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
    <div className="bg-gradient-to-br from-primary-50 via-primary-50 to-primary-50 rounded-2xl shadow-card p-8 text-center border border-primary-200">
      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AppIcon name="party-popper" className="w-10 h-10 text-primary-600" aria-hidden />
      </div>

      <h2 className="text-3xl font-bold text-neutral-900 mb-2">
        You did it, {childName}!
      </h2>

      <p className="text-neutral-600 text-lg mb-6">
        Another session complete – you're on fire!
      </p>

      {/* Stats Row */}
      <div className="flex items-center justify-center gap-4">
        {/* XP Earned */}
        <div className="bg-neutral-0 rounded-xl p-4 shadow-sm min-w-[100px]">
          <div className="text-2xl font-bold text-primary-600">
            +{gamification.xpEarned}
          </div>
          <div className="text-xs text-neutral-500 mt-1">XP earned</div>
        </div>

        {/* Streak */}
        <div className="bg-neutral-0 rounded-xl p-4 shadow-sm min-w-[100px]">
          <div className="flex items-center justify-center gap-1">
            <AppIcon
              name={fireIcon}
              className="text-accent-orange"
              aria-hidden
            />
            <span className="text-2xl font-bold text-neutral-900">
              {gamification.currentStreak}
            </span>
          </div>
          <div className="text-xs text-neutral-500 mt-1">day streak</div>
        </div>

        {/* Badge (if earned) */}
        {gamification.newBadge && (
          <div className="bg-neutral-0 rounded-xl p-4 shadow-sm min-w-[100px]">
            <AppIcon
              name={trophyIcon}
              className="text-accent-amber text-2xl mx-auto"
              aria-hidden
            />
            <div className="text-xs text-neutral-500 mt-1">New badge!</div>
          </div>
        )}
      </div>
    </div>
  );
}
