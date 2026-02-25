// src/components/parent/dashboard/WeeklyFocusStrip.tsx
// Insight banner showing weekly focus pattern (FEAT-009)
// FEAT-010: AppIcon (lucide-react) + theme-ready classes (no FontAwesome)

import React from "react";
import type { WeeklyFocusStripProps } from "../../../types/parent/parentDashboardTypes";
import AppIcon from "../../ui/AppIcon";

export function WeeklyFocusStrip({
  dailyPattern,
  onSeeWhy,
}: WeeklyFocusStripProps) {
  const activeDays = dailyPattern.filter((d) => d.sessions_completed > 0).length;
  const totalPlanned = dailyPattern.filter((d) => d.sessions_total > 0).length;
  const restDays = dailyPattern.filter((d) => d.is_rest_day).length;

  const getMessage = () => {
    if (activeDays >= 5) return "Excellent consistency this week!";
    if (activeDays >= 3) return "Good rhythm building up";
    if (activeDays >= 1) return "Getting started this week";
    return "Ready to begin this week's revision";
  };

  const handleSeeWhy = () => {
    onSeeWhy();
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <section className="mb-8">
      <div className="bg-primary/5 rounded-xl p-5 border border-primary/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <AppIcon name="rocket" className="w-6 h-6 text-primary-foreground" />
            </div>

            <div>
              <div className="text-base font-semibold text-primary">
                {getMessage()}
              </div>
              <div className="text-sm text-muted-foreground">
                {activeDays} of {totalPlanned} planned days complete · {restDays}{" "}
                rest day{restDays !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <button
            onClick={handleSeeWhy}
            className="text-sm font-medium text-primary hover:text-primary flex items-center gap-2"
          >
            See why this matters
            <AppIcon name="arrow-right" className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}

export default WeeklyFocusStrip;
