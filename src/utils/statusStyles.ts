// src/utils/statusStyles.ts
// FEAT-010: Centralised status UI mapping - single source of truth

import type { IconKey } from "../components/ui/AppIcon";

export type StatusIndicator =
  | "on_track"
  | "keep_an_eye"
  | "needs_attention"
  | "getting_started";

type StatusUI = {
  badgeClass: string;
  insightClass: string;
  headline: string;
  description: string;
  badgeText: string;
  icon: IconKey;
};

export const STATUS_UI: Record<StatusIndicator, StatusUI> = {
  on_track: {
    badgeClass: "bg-accent-green text-white",
    insightClass: "bg-success-bg border border-success-border",
    headline: "Everything's on track this week",
    description:
      "Your children are keeping a steady revision rhythm. Sessions are happening consistently, and engagement is strong across all subjects.",
    badgeText: "On Track",
    icon: "check-circle",
  },
  keep_an_eye: {
    badgeClass: "bg-info text-white",
    insightClass: "bg-info-bg border border-info-border",
    headline: "Worth keeping an eye on",
    description:
      "Activity has slowed slightly. Nothing to worry about yet, but worth monitoring over the next few days.",
    badgeText: "Keep an Eye",
    icon: "eye",
  },
  needs_attention: {
    badgeClass: "bg-warning text-white",
    insightClass: "bg-warning-bg border border-warning-border",
    headline: "Some sessions need a little boost",
    description:
      "A few sessions were missed this week. A gentle check-in with your children could help get things back on track.",
    badgeText: "Needs Attention",
    icon: "hand-heart",
  },
  getting_started: {
    badgeClass: "bg-accent-purple text-white",
    insightClass: "bg-primary-50 border border-primary-200",
    headline: "Great start to the revision journey",
    description:
      "Your family is just getting started with Doorslam. The first sessions are always the hardest — you're doing great!",
    badgeText: "Getting Started",
    icon: "rocket",
  },
};

export function getStatusUI(status: StatusIndicator): StatusUI {
  return STATUS_UI[status] ?? STATUS_UI.on_track;
}

export function getStatusBadgeClasses(status: StatusIndicator): string {
  return getStatusUI(status).badgeClass;
}

export function getStatusInsightClasses(status: StatusIndicator): string {
  return getStatusUI(status).insightClass;
}

export function getStatusContent(status: StatusIndicator) {
  const { headline, description, badgeText, icon } = getStatusUI(status);
  return { headline, description, badgeText, icon };
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-child hero sentence generation
// Used to create personalized descriptions for multi-child families
// ─────────────────────────────────────────────────────────────────────────────

interface ChildHeroContext {
  firstName: string;
  preferredName?: string | null;
  status: StatusIndicator;
  sessionsCompleted: number;
  sessionsTotal: number;
}

const CHILD_HERO_TEMPLATES: Record<StatusIndicator, string[]> = {
  on_track: [
    "{name} completed {completed} sessions and is on track.",
    "{name}'s keeping up great momentum this week.",
  ],
  keep_an_eye: [
    "{name} has slowed down a bit — worth keeping an eye on.",
    "{name}'s activity dipped slightly this week.",
  ],
  needs_attention: [
    "{name} missed a few sessions — a gentle nudge might help.",
    "{name} could use a little encouragement this week.",
  ],
  getting_started: [
    "{name} is just getting started — great first steps!",
    "{name}'s beginning their revision journey.",
  ],
};

/**
 * Generate a personalized hero sentence for a single child.
 * Uses preferred_name (nickname) if available, otherwise first_name.
 */
export function generateChildHeroSentence(context: ChildHeroContext): string {
  const name = context.preferredName || context.firstName;
  const templates = CHILD_HERO_TEMPLATES[context.status] ?? CHILD_HERO_TEMPLATES.on_track;

  // Use first template for simplicity (could randomize later)
  const template = templates[0];

  return template
    .replace("{name}", name)
    .replace("{completed}", String(context.sessionsCompleted));
}

/**
 * Generate a family description from multiple children's data.
 * Returns personalized sentences for each child, joined together.
 */
export function generateFamilyDescription(
  children: Array<{
    first_name: string;
    preferred_name?: string | null;
    status_indicator: StatusIndicator;
    week_sessions_completed: number;
    week_sessions_total: number;
  }>
): string {
  if (children.length === 0) {
    return "";
  }

  const sentences = children.map((child) =>
    generateChildHeroSentence({
      firstName: child.first_name,
      preferredName: child.preferred_name,
      status: child.status_indicator,
      sessionsCompleted: child.week_sessions_completed,
      sessionsTotal: child.week_sessions_total,
    })
  );

  return sentences.join(" ");
}
