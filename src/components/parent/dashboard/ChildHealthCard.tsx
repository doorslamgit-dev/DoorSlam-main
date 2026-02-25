// src/components/parent/dashboard/ChildHealthCard.tsx
// Individual child card for Parent Dashboard v2 (FEAT-009)
// Updated: FEAT-010 - AppIcon (lucide-react) + theme-ready classes (no FontAwesome, no hard-coded hex)

import React from "react";

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";
import type {
  ChildHealthCardProps,
  StatusIndicator,
} from "../../../types/parent/parentDashboardTypes";
import { getStatusUI } from "../../../utils/statusStyles";

// Extended to include keep_an_eye (some data sources still use it)
type ExtendedStatusIndicator = StatusIndicator | "keep_an_eye";

const statusStyles: Record<
  ExtendedStatusIndicator,
  {
    badgeBg: string;
    badgeText: string;
    insightBg: string;
    insightBorder: string;
  }
> = {
  on_track: {
    badgeBg: "bg-success",
    badgeText: "text-white",
    insightBg: "bg-success/10",
    insightBorder: "border-success/20",
  },
  keep_an_eye: {
    badgeBg: "bg-primary",
    badgeText: "text-primary-foreground",
    insightBg: "bg-primary/5",
    insightBorder: "border-primary/20",
  },
  needs_attention: {
    badgeBg: "bg-warning",
    badgeText: "text-white",
    insightBg: "bg-warning/10",
    insightBorder: "border-warning/20",
  },
  getting_started: {
    badgeBg: "bg-foreground",
    badgeText: "text-white",
    insightBg: "bg-muted",
    insightBorder: "border-border",
  },
};

function insightIconKey(value: unknown): IconKey {
  // `child.insight_icon` used to be FontAwesome names (e.g. "lightbulb", "chart-line", etc.)
  // We map only the supported subset to stable IconKey values.
  if (typeof value !== "string") return "lightbulb";

  switch (value) {
    case "lightbulb":
      return "lightbulb";
    case "calendar-check":
      return "calendar-check";
    case "calendar-clock":
      return "calendar-clock";
    case "message-circle":
    case "comments":
      return "message-circle";
    case "chart-line":
      return "chart-line";
    case "chart-bar":
      return "chart-bar";
    case "hand-heart":
      return "hand-heart";
    case "rocket":
      return "rocket";
    case "trophy":
      return "trophy";
    case "target":
      return "target";
    case "trending-up":
      return "trending-up";
    case "trending-down":
      return "trending-down";
    case "triangle-alert":
      return "triangle-alert";
    case "clock":
      return "clock";
    case "book":
      return "book";
    case "book-open":
      return "book-open";
    case "sprout":
      return "sprout";
    case "check-circle":
      return "check-circle";
    case "check":
      return "check";
    default:
      return "lightbulb";
  }
}

export function ChildHealthCard({
  child,
  onGoToToday,
  onViewInsights,
}: ChildHealthCardProps) {
  const style =
    statusStyles[child.status_indicator as ExtendedStatusIndicator] ||
    statusStyles.on_track;

  const initials =
    child.first_name.charAt(0) + (child.last_name?.charAt(0) || "");

  const ctaText =
    child.status_indicator === "getting_started"
      ? "Start First Session"
      : "Go to Today's Sessions";

  const handleGoToToday = () => {
    onGoToToday(child.child_id);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleViewInsights = () => {
    onViewInsights(child.child_id);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const insightIcon = insightIconKey((child as unknown as Record<string, unknown>).insight_icon as string | undefined);

  const statusForUI =
    child.status_indicator === "keep_an_eye"
      ? ("keep_an_eye" as ExtendedStatusIndicator)
      : (child.status_indicator as ExtendedStatusIndicator);

  // Optional: keep the existing UI helper available if you need it later.
  // Not used directly here, but retained for future alignment.
  void getStatusUI;

  return (
    <div className="bg-background rounded-2xl shadow-sm p-6 border border-border/50">
      {/* Header: Avatar + Name + Status */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          {child.avatar_url ? (
            <img
              src={child.avatar_url}
              alt={child.child_name}
              width={56}
              height={56}
              className="w-14 h-14 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
              <span className="text-lg font-bold text-primary">
                {initials}
              </span>
            </div>
          )}

          <div>
            <h3 className="text-xl font-bold text-primary">
              {child.child_name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Year {child.year_group}</span>
              <span>·</span>
              <span>{child.exam_type}</span>
            </div>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${style.badgeBg} ${style.badgeText}`}
          data-status={statusForUI}
        >
          {child.status_label}
        </span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {/* Momentum */}
        <div className="bg-muted rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {child.current_streak > 0 ? `${child.current_streak}` : "—"}
          </div>
          <div className="text-xs text-muted-foreground font-medium">Day Streak</div>
        </div>

        {/* Sessions */}
        <div className="bg-muted rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {child.week_sessions_completed}/{child.week_sessions_total}
          </div>
          <div className="text-xs text-muted-foreground font-medium">This Week</div>
        </div>

        {/* Next Up */}
        <div className="bg-muted rounded-xl p-4 text-center">
          <div className="text-sm font-bold text-primary mb-1 truncate">
            {child.next_focus?.subject_name || "—"}
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            {child.next_focus ? "Next Up" : "No Session"}
          </div>
        </div>
      </div>

      {/* Insight Box */}
      <div
        className={`${style.insightBg} ${style.insightBorder} border rounded-xl p-4 mb-5`}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center flex-shrink-0 shadow-soft border border-border/50">
            <AppIcon
              name={insightIcon}
              className="w-4 h-4 text-primary"
              aria-hidden
            />
          </div>

          <div>
            <div className="text-sm font-semibold text-primary">
              {child.insight_message}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {child.insight_sub_message}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex gap-3">
        <button
          onClick={handleGoToToday}
          className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          {ctaText}
        </button>

        <button
          onClick={handleViewInsights}
          className="px-4 py-3 bg-secondary text-muted-foreground rounded-xl hover:bg-muted transition-colors"
          aria-label="View insights"
          title="View insights"
        >
          <AppIcon name="chart-line" className="w-5 h-5" aria-hidden />
        </button>
      </div>

      {/* Mocks Warning */}
      {child.mocks_flag && child.mocks_message && (
        <div className="mt-4 bg-warning/10 border border-accent-amber/20 rounded-lg p-3 flex items-center gap-2">
          <AppIcon
            name="calendar-clock"
            className="w-4 h-4 text-warning"
            aria-hidden
          />
          <span className="text-sm font-medium text-warning">
            {child.mocks_message}
          </span>
        </div>
      )}
    </div>
  );
}

export default ChildHealthCard;
