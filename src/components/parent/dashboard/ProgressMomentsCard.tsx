// src/components/parent/dashboard/ProgressMomentsCard.tsx
// Celebration moments card for Parent Dashboard v2 (FEAT-009)
// FEAT-010: AppIcon + stable icon mapping (no FontAwesome)

import React from "react";

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";
import type {
  ProgressMomentsCardProps,
  MomentType,
} from "../../../types/parent/parentDashboardTypes";

const momentConfig: Record<
  MomentType,
  {
    iconBg: string;
    borderColor: string;
    icon: IconKey;
  }
> = {
  achievement: {
    iconBg: "bg-warning",
    borderColor: "border-warning/20",
    icon: "trophy",
  },
  sessions_milestone: {
    iconBg: "bg-success",
    borderColor: "border-success/20",
    icon: "check-circle",
  },
  streak_milestone: {
    iconBg: "bg-warning",
    borderColor: "border-warning/20",
    icon: "flame",
  },
  getting_started: {
    iconBg: "bg-primary",
    borderColor: "border-primary/20",
    icon: "sprout",
  },
  focus_mode: {
    iconBg: "bg-primary",
    borderColor: "border-primary/20",
    icon: "bolt",
  },
};

export function ProgressMomentsCard({ moments }: ProgressMomentsCardProps) {
  if (moments.length === 0) {
    return (
      <div className="bg-background rounded-2xl shadow-sm p-6 border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-primary">
            Progress Moments
          </h3>
        </div>

        <div className="text-center py-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <AppIcon
              name="sparkles"
              className="w-6 h-6 text-primary"
              aria-hidden
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Moments will appear as progress is made
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-2xl shadow-sm p-6 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-primary">Progress Moments</h3>
        <AppIcon
          name="sparkles"
          className="w-5 h-5 text-warning"
          aria-hidden
        />
      </div>

      <div className="space-y-3">
        {moments.map((moment, index) => {
          const config =
            momentConfig[moment.moment_type] ??
            momentConfig.getting_started;

          return (
            <div
              key={`${moment.child_id}-${moment.moment_type}-${index}`}
              className={`flex items-start gap-3 p-4 rounded-xl bg-muted border ${config.borderColor}`}
            >
              {/* Avatar */}
              {moment.avatar_url ? (
                <img
                  src={moment.avatar_url}
                  alt={moment.child_name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {moment.child_name.charAt(0)}
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-primary">
                  {moment.message}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {moment.sub_message}
                </div>
              </div>

              {/* Icon */}
              <div
                className={`w-8 h-8 ${config.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}
              >
                <AppIcon
                  name={config.icon}
                  className="w-4 h-4 text-white"
                  aria-hidden
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProgressMomentsCard;
