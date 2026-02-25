// src/components/parent/dashboard/HeroStatusBanner.tsx
// Hero status banner for Parent Dashboard v2 (FEAT-009)
// Updated: FEAT-010 - Uses centralized statusStyles, expandable nudges
// FEAT-010: AppIcon (lucide-react) + theme-ready classes (no hard-coded hex)

import React, { useState } from "react";
import type {
  HeroStatusBannerProps,
  StatusIndicator,
  GentleReminder,
  ChildSummary,
} from "../../../types/parent/parentDashboardTypes";
import { getStatusUI, generateFamilyDescription } from "../../../utils/statusStyles";
import AppIcon, { hasIcon } from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

interface ExtendedHeroStatusBannerProps extends HeroStatusBannerProps {
  onAddChild: () => void;
  /** Children data for generating personalized family description */
  children?: ChildSummary[];
}

function toTitleCaseStatus(status: StatusIndicator) {
  if (status === "needs_attention") return "Needs Attention";
  if (status === "keep_an_eye") return "Keep an Eye";
  if (status === "getting_started") return "Getting Started";
  return "On Track";
}

function safeStatusIndicator(value: unknown): StatusIndicator | null {
  if (
    value === "on_track" ||
    value === "keep_an_eye" ||
    value === "needs_attention" ||
    value === "getting_started"
  ) {
    return value;
  }
  return null;
}

function nudgeTypeIcon(type: GentleReminder["type"]): IconKey {
  switch (type) {
    case "status_explainer":
      return "hand-heart";
    case "mocks_coming_up":
      return "calendar-clock";
    case "topic_to_revisit":
      return "rotate-ccw";
    case "subject_neglected":
      return "book";
    default:
      return "lightbulb";
  }
}

function safeIconKey(value: unknown, fallback: IconKey = "info"): IconKey {
  return typeof value === "string" && hasIcon(value) ? value : fallback;
}

// Nudge detail modal
function NudgeDetail({
  reminder,
  onClose,
}: {
  reminder: GentleReminder;
  onClose: () => void;
}) {
  const reminderStatus = safeStatusIndicator(reminder.status_indicator);
  const reminderUI = reminderStatus ? getStatusUI(reminderStatus) : null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-2xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-amber/15 rounded-xl flex items-center justify-center">
              <AppIcon
                name="lightbulb"
                className="w-5 h-5 text-warning"
                aria-hidden
              />
            </div>

            <div>
              <span className="font-semibold text-primary">
                {reminder.child_name}
              </span>

              {reminderStatus && reminderUI && (
                <span
                  className={`ml-2 text-xs px-2 py-0.5 rounded-full ${reminderUI.badgeClass}`}
                >
                  {toTitleCaseStatus(reminderStatus)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <AppIcon name="x" className="w-5 h-5" aria-hidden />
          </button>
        </div>

        <p className="text-foreground mb-4">{reminder.message}</p>

        {reminder.subject_name && (
          <div className="bg-muted rounded-lg p-3 mb-4">
            <span className="text-xs text-muted-foreground font-medium">
              Subject
            </span>
            <p className="font-medium text-primary">
              {reminder.subject_name}
            </p>
            {reminder.topic_name && (
              <p className="text-sm text-muted-foreground">{reminder.topic_name}</p>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

export function HeroStatusBanner({
  weekSummary,
  comingUpCount,
  onViewTodaySessions,
  onViewInsights,
  reminders,
  onAddChild,
  children,
}: ExtendedHeroStatusBannerProps) {
  const [showNudges, setShowNudges] = useState(false);
  const [selectedNudge, setSelectedNudge] = useState<GentleReminder | null>(
    null
  );

  const status = (weekSummary.family_status || "on_track") as StatusIndicator;
  const ui = getStatusUI(status);
  const nudgeCount = reminders.length;

  // Generate personalized family description if children data is available
  // Priority: 1. Backend-provided family_description, 2. Generated from children, 3. Static template
  const familyDescription =
    weekSummary.family_description ||
    (children && children.length > 0
      ? generateFamilyDescription(
          children.map((c) => ({
            first_name: c.first_name,
            preferred_name: c.preferred_name ?? null,
            status_indicator: c.status_indicator,
            week_sessions_completed: c.week_sessions_completed,
            week_sessions_total: c.week_sessions_total,
          }))
        )
      : ui.description);

  const statusIcon = safeIconKey(ui.icon, "info");

  return (
    <section className="mb-10">
      <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-background rounded-2xl shadow-sm p-8 border border-primary/20">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h2 className="text-3xl font-bold text-primary">
                {ui.headline}
              </h2>

              <span
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${ui.badgeClass}`}
              >
                <AppIcon name={statusIcon} className="w-4 h-4" aria-hidden />
                {ui.badgeText}
              </span>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              {familyDescription}
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Revision Rhythm */}
          <div className="bg-background rounded-xl p-5 shadow-soft border border-border">
            <div className="mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <AppIcon
                  name="calendar-check"
                  className="w-6 h-6 text-primary"
                  aria-hidden
                />
              </div>
            </div>
            <div className="text-2xl font-bold text-primary mb-1">
              {weekSummary.days_active} active day
              {weekSummary.days_active !== 1 ? "s" : ""}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Revision Rhythm
            </div>
          </div>

          {/* Coming Up */}
          <div className="bg-background rounded-xl p-5 shadow-soft border border-border">
            <div className="mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <AppIcon
                  name="clock"
                  className="w-6 h-6 text-primary"
                  aria-hidden
                />
              </div>
            </div>
            <div className="text-2xl font-bold text-primary mb-1">
              {comingUpCount} session{comingUpCount !== 1 ? "s" : ""}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Coming Up
            </div>
          </div>

          {/* Active Coverage */}
          <div className="bg-background rounded-xl p-5 shadow-soft border border-border">
            <div className="mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <AppIcon
                  name="book-open"
                  className="w-6 h-6 text-primary"
                  aria-hidden
                />
              </div>
            </div>
            <div className="text-2xl font-bold text-primary mb-1">
              {weekSummary.subjects_active} subject
              {weekSummary.subjects_active !== 1 ? "s" : ""}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Active Coverage
            </div>
          </div>

          {/* Helpful Nudges */}
          <button
            onClick={() => setShowNudges(!showNudges)}
            className="bg-background rounded-xl p-5 shadow-soft hover:shadow-sm transition-all border border-border text-left group"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-12 h-12 ${
                  nudgeCount > 0 ? "bg-accent-amber/15" : "bg-accent-green/15"
                } rounded-xl flex items-center justify-center`}
              >
                <AppIcon
                  name={nudgeCount > 0 ? "lightbulb" : "check"}
                  className={`w-6 h-6 ${
                    nudgeCount > 0 ? "text-warning" : "text-success"
                  }`}
                  aria-hidden
                />
              </div>

              {nudgeCount > 0 && (
                <span className="text-xs text-primary font-medium group-hover:underline">
                  {showNudges ? "Hide" : "View all"}
                </span>
              )}
            </div>

            <div className="text-2xl font-bold text-primary mb-1">
              {nudgeCount > 0
                ? `${nudgeCount} nudge${nudgeCount !== 1 ? "s" : ""}`
                : "All good!"}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              {nudgeCount > 0 ? "Click to see details" : "Helpful Nudges"}
            </div>
          </button>
        </div>

        {/* Expanded Nudges List */}
        {showNudges && nudgeCount > 0 && (
          <div className="bg-accent-amber/10 rounded-xl p-4 mb-6 border border-accent-amber/20">
            <div className="flex items-center gap-2 mb-3">
              <AppIcon
                name="lightbulb"
                className="w-4 h-4 text-warning"
                aria-hidden
              />
              <h3 className="font-semibold text-primary">Helpful Nudges</h3>
            </div>

            <div className="space-y-2">
              {reminders.map((reminder, idx) => {
                const reminderStatus = safeStatusIndicator(
                  reminder.status_indicator
                );
                const reminderUI = reminderStatus
                  ? getStatusUI(reminderStatus)
                  : null;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedNudge(reminder)}
                    className="w-full bg-background rounded-lg p-3 text-left hover:shadow-md transition-shadow border border-border flex items-start gap-3"
                  >
                    <div className="w-8 h-8 bg-accent-amber/15 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AppIcon
                        name={nudgeTypeIcon(reminder.type)}
                        className="w-4 h-4 text-warning"
                        aria-hidden
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-primary">
                          {reminder.child_name}
                        </span>

                        {reminderStatus && reminderUI && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${reminderUI.badgeClass}`}
                          >
                            {toTitleCaseStatus(reminderStatus)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {reminder.message}
                      </p>
                    </div>

                    <AppIcon
                      name="chevron-right"
                      className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-2"
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CTAs Row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onViewTodaySessions}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-soft"
            >
              View today's sessions
            </button>
            <button
              onClick={onViewInsights}
              className="px-6 py-3 bg-background text-primary rounded-xl font-semibold hover:bg-primary/5 transition-colors border border-primary/20"
            >
              Check progress details
            </button>
          </div>

          <button
            onClick={onAddChild}
            className="px-5 py-3 bg-background text-primary rounded-xl font-semibold hover:bg-primary/5 transition-colors border border-primary/20 flex items-center gap-2"
          >
            <AppIcon name="user-plus" className="w-4 h-4" aria-hidden />
            Add Child
          </button>
        </div>
      </div>

      {/* Nudge Detail Modal */}
      {selectedNudge && (
        <NudgeDetail
          reminder={selectedNudge}
          onClose={() => setSelectedNudge(null)}
        />
      )}
    </section>
  );
}

export default HeroStatusBanner;
