// src/utils/statusStyles.ts
// FEAT-010: Centralised status UI mapping - single source of truth

import type { IconKey } from "../components/ui/AppIcon";
import { COLORS } from "../constants/colors";

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
    insightClass: "bg-green-50 border border-green-200",
    headline: "Everything's on track this week",
    description:
      "Your children are keeping a steady revision rhythm. Sessions are happening consistently, and engagement is strong across all subjects.",
    badgeText: "On Track",
    icon: "check-circle",
  },
  keep_an_eye: {
    badgeClass: "bg-info text-white",
    insightClass: "bg-blue-50 border border-blue-200",
    headline: "Worth keeping an eye on",
    description:
      "Activity has slowed slightly. Nothing to worry about yet, but worth monitoring over the next few days.",
    badgeText: "Keep an Eye",
    icon: "eye",
  },
  needs_attention: {
    badgeClass: "bg-warning text-white",
    insightClass: "bg-amber-50 border border-amber-200",
    headline: "Some sessions need a little boost",
    description:
      "A few sessions were missed this week. A gentle check-in with your children could help get things back on track.",
    badgeText: "Needs Attention",
    icon: "hand-heart",
  },
  getting_started: {
    badgeClass: "bg-accent-purple text-white",
    insightClass: "bg-purple-50 border border-purple-200",
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
