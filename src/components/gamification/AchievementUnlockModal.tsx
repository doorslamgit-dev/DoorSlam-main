// src/components/gamification/AchievementUnlockModal.tsx
// FEAT-010: AppIcon (Lucide) only — no FontAwesome, no fa- classes, no hex colours

import { useState, useEffect } from "react";
import AppIcon from "../ui/AppIcon";
import { getAchievementIcon } from "../../services/gamificationService";
import type { NewlyEarnedAchievement } from "../../types/gamification";

type AchievementUnlockModalProps = {
  achievements: NewlyEarnedAchievement[];
  onClose: () => void;
  onMarkNotified?: () => void;
};

export default function AchievementUnlockModal({
  achievements,
  onClose,
  onMarkNotified,
}: AchievementUnlockModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const currentAchievement = achievements[currentIndex];
  const hasMore = currentIndex < achievements.length - 1;
  const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);

  useEffect(() => {
    // Reset animation when changing achievement
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleNext = () => {
    if (hasMore) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onMarkNotified?.();
      onClose();
    }
  };

  if (!currentAchievement) return null;

  // Achievement “icon” is currently emoji-based via service.
  // We keep that as content (not a UI icon library concern).
  const icon = getAchievementIcon(currentAchievement.icon);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-neutral-0 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-neutral-200/50">
        {/* Confetti background effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-accent-amber rounded-full animate-confetti-1" />
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-primary-500 rounded-full animate-confetti-2" />
          <div className="absolute top-0 left-3/4 w-2 h-2 bg-accent-green rounded-full animate-confetti-3" />
          <div className="absolute top-0 left-1/3 w-2 h-2 bg-primary-600 rounded-full animate-confetti-4" />
          <div className="absolute top-0 left-2/3 w-2 h-2 bg-primary-400 rounded-full animate-confetti-5" />
        </div>

        {/* Header */}
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-6 pt-8 pb-16 text-center">
          <div className="flex items-center justify-center gap-2 text-neutral-0/85 text-sm font-medium mb-2">
            <AppIcon name="party-popper" className="w-4 h-4" aria-hidden />
            <span>Achievement Unlocked!</span>
          </div>

          {achievements.length > 1 && (
            <div className="text-neutral-0/70 text-xs">
              {currentIndex + 1} of {achievements.length}
            </div>
          )}
        </div>

        {/* Achievement card */}
        <div className="px-6 -mt-12 pb-6">
          <div
            className={`bg-neutral-0 rounded-2xl shadow-lg border border-neutral-200/50 p-6 text-center ${
              isAnimating ? "animate-achievement-pop" : ""
            }`}
          >
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-4 bg-accent-amber/15 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
              {icon}
            </div>

            {/* Name */}
            <h3 className="text-xl font-bold text-primary-900 mb-2">
              {currentAchievement.name}
            </h3>

            {/* Description */}
            <p className="text-neutral-600 mb-4">
              {currentAchievement.description}
            </p>

            {/* Points earned */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-amber/10 rounded-full border border-accent-amber/20">
              <AppIcon
                name="sparkles"
                className="w-4 h-4 text-accent-amber"
                aria-hidden
              />
              <span className="font-bold text-primary-900">
                +{currentAchievement.points} points
              </span>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleNext}
            className="w-full mt-6 py-4 rounded-xl bg-primary-600 text-neutral-0 font-semibold text-lg hover:bg-primary-700 transition-colors shadow-lg"
          >
            {hasMore ? "Next Achievement" : "Awesome!"}
          </button>

          {/* Total points if multiple */}
          {achievements.length > 1 &&
            currentIndex === achievements.length - 1 && (
              <div className="mt-4 text-center text-sm text-neutral-600">
                Total earned:{" "}
                <span className="font-semibold text-accent-amber">
                  +{totalPoints} points
                </span>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

// Single achievement badge (for lists)
export function AchievementBadge({
  name,
  icon,
  earned,
}: {
  name: string;
  icon: string;
  earned?: boolean;
}) {
  const iconEmoji = getAchievementIcon(icon);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
        earned
          ? "bg-accent-amber/10 border-accent-amber/20"
          : "bg-neutral-50 border-neutral-200 opacity-50"
      }`}
    >
      <span className="text-2xl">{iconEmoji}</span>

      <span
        className={`font-medium ${earned ? "text-primary-900" : "text-neutral-500"}`}
      >
        {name}
      </span>

      {earned && (
        <span className="ml-auto inline-flex items-center">
          <AppIcon
            name="check"
            className="w-4 h-4 text-accent-green"
            aria-hidden
          />
        </span>
      )}
    </div>
  );
}
