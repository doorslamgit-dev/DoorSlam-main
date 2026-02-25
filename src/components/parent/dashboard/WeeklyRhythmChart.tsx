// src/components/parent/dashboard/WeeklyRhythmChart.tsx
// Weekly activity bar chart for Parent Dashboard v2 (FEAT-009)
// FEAT-010: Theme-ready colours (no hard-coded hex), AppIcon via name keys (no ICON_MAP import)

import React from "react";
import type { WeeklyRhythmChartProps } from "../../../types/parent/parentDashboardTypes";
import AppIcon from "../../ui/AppIcon";

export function WeeklyRhythmChart({
  dailyPattern,
  onViewDetailedBreakdown,
}: WeeklyRhythmChartProps) {
  const maxSessions = Math.max(...dailyPattern.map((d) => d.sessions_total), 1);

  const handleViewDetails = () => {
    onViewDetailedBreakdown();
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <div className="bg-background rounded-2xl shadow-sm p-6 border border-border">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <AppIcon name="check-circle" className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-primary">Weekly Rhythm</h3>
        </div>

        <button
          onClick={handleViewDetails}
          className="text-sm font-medium text-primary hover:text-primary flex items-center gap-1"
        >
          Details
          <AppIcon name="chevron-right" className="w-4 h-4" aria-hidden />
        </button>
      </div>

      {/* Chart */}
      <div className="flex items-end justify-between gap-2 h-32 mb-4">
        {dailyPattern.map((day) => {
          const totalHeight =
            day.sessions_total > 0 ? (day.sessions_total / maxSessions) * 100 : 10;

          const completedHeight =
            day.sessions_completed > 0
              ? (day.sessions_completed / maxSessions) * 100
              : 0;

          // Avoid NaN when totalHeight is 0 (it won’t be, but keep it safe)
          const completedPercentOfTotal =
            totalHeight > 0
              ? Math.min((completedHeight / totalHeight) * 100, 100)
              : 0;

          return (
            <div key={day.day_of_week} className="flex-1 flex flex-col items-center">
              <div
                className="w-full rounded-t-md bg-muted relative"
                style={{ height: `${totalHeight}%`, minHeight: "8px" }}
                aria-label={`${day.day_name_short}: ${day.sessions_completed}/${day.sessions_total} sessions`}
              >
                {/* Completed portion */}
                <div
                  className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-md transition-all"
                  style={{ height: `${completedPercentOfTotal}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Day labels */}
      <div className="flex justify-between gap-2">
        {dailyPattern.map((day) => (
          <div key={day.day_of_week} className="flex-1 text-center">
            <span
              className={`text-xs font-medium ${
                day.is_rest_day ? "text-muted-foreground" : "text-muted-foreground"
              }`}
            >
              {day.day_name_short}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span className="text-xs text-muted-foreground">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <span className="text-xs text-muted-foreground">Planned</span>
        </div>
      </div>
    </div>
  );
}

export default WeeklyRhythmChart;
