// src/components/parent/dashboard/HelpfulNudgesCard.tsx
// Enhanced version with status explainer functionality
// FEAT-010: AppIcon (lucide-react) + stable IconKey typing + theme-ready classes (no FontAwesome, no hex)

import React from "react";
import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";
import { getStatusUI, type StatusIndicator } from "../../../utils/statusStyles";

interface StatusExplainer {
  status_indicator:
    | "on_track"
    | "keep_an_eye"
    | "needs_attention"
    | "getting_started";
  status_reason: string;
  status_detail: string;
  child_name: string;
}

interface Nudge {
  id: string;
  type: "status_explainer" | "tip" | "reminder" | "celebration";
  priority: number;
  icon: string;
  title: string;
  message: string;
  action_label?: string;
  action_url?: string;
  color: string; // legacy API field; we do NOT use it for styling in UI (token colours only)
}

interface HelpfulNudgesCardProps {
  nudges?: Nudge[];
  statusExplainers?: StatusExplainer[];
  maxItems?: number;
}

const STATUS_EXPLAINER_CONFIG: Record<
  string,
  {
    title: string;
    explanation: string;
    suggestion: string;
    actionLabel: string;
    actionUrl: string;
  }
> = {
  no_recent_activity: {
    title: "Time for a gentle check-in",
    explanation:
      "It's been a while since their last session. Life gets busy – this happens!",
    suggestion:
      "A quick chat about their revision can help get things moving again. No pressure needed.",
    actionLabel: "View their schedule",
    actionUrl: "/parent/timetable",
  },
  schedule_behind: {
    title: "Sessions falling behind this week",
    explanation:
      "Fewer sessions completed than planned. This is quite common mid-week.",
    suggestion:
      "Consider a brief conversation about what's working and what might need adjusting.",
    actionLabel: "Check progress details",
    actionUrl: "/parent/subjects",
  },
  confidence_declining: {
    title: "Confidence seems to be dipping",
    explanation:
      "Recent sessions show declining confidence levels. This might indicate struggle with topics.",
    suggestion:
      "Ask how they're finding the material. They might benefit from revisiting earlier content.",
    actionLabel: "Review subject progress",
    actionUrl: "/parent/subjects",
  },
  streak_broken: {
    title: "Revision momentum has paused",
    explanation:
      "Their streak has ended and activity has slowed. Building habits takes time.",
    suggestion:
      "Encouragement works better than pressure. Celebrate what they've achieved so far.",
    actionLabel: "See their achievements",
    actionUrl: "/parent/insights",
  },
  activity_gap: {
    title: "Keep an eye on activity",
    explanation:
      "A few days without sessions. Not a concern yet, but worth monitoring.",
    suggestion:
      "No action needed right now. Just keep it on your radar for the next day or two.",
    actionLabel: "View schedule",
    actionUrl: "/parent/timetable",
  },
  schedule_slipping: {
    title: "Schedule tracking slightly behind",
    explanation:
      "Sessions are a bit behind the plan, but there's still time to catch up.",
    suggestion:
      "They might catch up naturally. Check back in a day or two before stepping in.",
    actionLabel: "View weekly plan",
    actionUrl: "/parent/timetable",
  },
  new_child: {
    title: "Building great habits",
    explanation:
      "Early days of their revision journey. Consistency matters more than volume.",
    suggestion:
      "Celebrate small wins to build positive associations with revision time.",
    actionLabel: "See their first sessions",
    actionUrl: "/parent/timetable",
  },
  progressing_well: {
    title: "Everything's on track",
    explanation:
      "Great progress! Sessions are being completed and confidence is steady.",
    suggestion: "No intervention needed. Your support is working!",
    actionLabel: "View detailed progress",
    actionUrl: "/parent/subjects",
  },
};

function getStatusIconKey(status: StatusIndicator): IconKey {
  switch (status) {
    case "needs_attention":
      return "hand-heart";
    case "keep_an_eye":
      return "eye";
    case "getting_started":
      return "sprout";
    default:
      return "check-circle";
  }
}

function getStatusPanelClasses(status: StatusIndicator) {
  switch (status) {
    case "needs_attention":
      return {
        bg: "bg-accent-amber/10",
        border: "border-accent-amber/20",
        text: "text-primary",
      };
    case "keep_an_eye":
      return {
        bg: "bg-primary/5",
        border: "border-primary/20",
        text: "text-primary",
      };
    case "getting_started":
      return {
        bg: "bg-muted",
        border: "border-border",
        text: "text-primary",
      };
    default:
      return {
        bg: "bg-accent-green/10",
        border: "border-accent-green/20",
        text: "text-primary",
      };
  }
}

function StatusExplainerItem({ explainer }: { explainer: StatusExplainer }) {
  const status = explainer.status_indicator as StatusIndicator;
  if (status === "on_track") return null;

  const ui = getStatusUI(status);
  const config =
    STATUS_EXPLAINER_CONFIG[explainer.status_reason] ??
    STATUS_EXPLAINER_CONFIG.progressing_well;

  const colors = getStatusPanelClasses(status);

  return (
    <div className={`rounded-xl p-4 ${colors.bg} border ${colors.border}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-background border border-border">
          <AppIcon
            name={getStatusIconKey(status)}
            className="w-5 h-5 text-primary"
            aria-hidden
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-primary">
              {explainer.child_name}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full text-white font-medium ${ui.badgeClass}`}
            >
              {ui.badgeText}
            </span>
          </div>

          <p className="font-medium text-sm text-primary-800">{config.title}</p>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-start gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide w-16 flex-shrink-0 pt-0.5">
            Why
          </span>
          <p className={`text-sm ${colors.text}`}>{config.explanation}</p>
        </div>

        <div className="flex items-start gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide w-16 flex-shrink-0 pt-0.5">
            Tip
          </span>
          <p className={`text-sm ${colors.text}`}>{config.suggestion}</p>
        </div>
      </div>

      <a
        href={config.actionUrl}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary transition-colors"
      >
        {config.actionLabel}
        <AppIcon name="arrow-right" className="w-4 h-4" aria-hidden />
      </a>
    </div>
  );
}

function nudgeIconKey(icon: string): IconKey {
  switch (icon) {
    case "lightbulb":
      return "lightbulb";
    case "calendar-check":
      return "calendar-check";
    case "comments":
    case "message-circle":
      return "message-circle";
    case "chart-line":
      return "chart-line";
    case "hand-heart":
      return "hand-heart";
    case "rocket":
      return "rocket";
    case "trophy":
      return "trophy";
    default:
      return "lightbulb";
  }
}

function nudgeTone(type: Nudge["type"]) {
  switch (type) {
    case "celebration":
      return {
        bg: "bg-accent-green/15",
        icon: "text-success",
        border: "border-accent-green/20",
      };
    case "reminder":
      return {
        bg: "bg-primary/5",
        icon: "text-primary",
        border: "border-primary/20",
      };
    case "tip":
      return {
        bg: "bg-accent-amber/15",
        icon: "text-warning",
        border: "border-accent-amber/20",
      };
    default:
      return {
        bg: "bg-secondary",
        icon: "text-muted-foreground",
        border: "border-border",
      };
  }
}

function NudgeItem({ nudge }: { nudge: Nudge }) {
  const iconKey = nudgeIconKey(nudge.icon);
  const tone = nudgeTone(nudge.type);

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg bg-muted border ${tone.border}`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tone.bg}`}
      >
        <AppIcon name={iconKey} className={`w-4 h-4 ${tone.icon}`} aria-hidden />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-primary">{nudge.title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{nudge.message}</p>

        {nudge.action_url && (
          <a
            href={nudge.action_url}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary mt-2"
          >
            {nudge.action_label || "Learn more"}
            <AppIcon name="arrow-right" className="w-3.5 h-3.5" aria-hidden />
          </a>
        )}
      </div>
    </div>
  );
}

export default function HelpfulNudgesCard({
  nudges = [],
  statusExplainers = [],
  maxItems = 3,
}: HelpfulNudgesCardProps) {
  const relevantExplainers = statusExplainers.filter(
    (e) => e.status_indicator !== "on_track"
  );

  if (relevantExplainers.length === 0 && nudges.length === 0) {
    return (
      <div className="bg-background rounded-2xl shadow-sm p-6 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent-green/15 flex items-center justify-center">
            <AppIcon name="rocket" className="w-5 h-5 text-success" aria-hidden />
          </div>
          <h3 className="text-lg font-semibold text-primary">
            All Looking Good!
          </h3>
        </div>
        <p className="text-muted-foreground text-sm">
          Everyone's revision is on track. Keep up the great support!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-2xl shadow-sm p-6 border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-accent-amber/15 flex items-center justify-center">
          <AppIcon
            name="lightbulb"
            className="w-5 h-5 text-warning"
            aria-hidden
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-primary">
            Helpful Nudges
          </h3>
          <p className="text-sm text-muted-foreground">Things worth knowing about</p>
        </div>
      </div>

      <div className="space-y-4">
        {relevantExplainers.slice(0, maxItems).map((explainer, idx) => (
          <StatusExplainerItem key={`explainer-${idx}`} explainer={explainer} />
        ))}

        {nudges
          .slice(0, Math.max(0, maxItems - relevantExplainers.length))
          .map((nudge) => (
            <NudgeItem key={nudge.id} nudge={nudge} />
          ))}
      </div>
    </div>
  );
}
