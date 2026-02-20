// src/components/timetable/NudgeBanner.tsx
// Top-right nudge banner — shows contextual guidance based on plan status.

import AppIcon from "../ui/AppIcon";
import Button from "../ui/Button";
import type { PlanCoverageOverview } from "../../services/timetableService";
import { getTimetableStatus } from "../../utils/timetableUtils";

interface NudgeBannerProps {
  planOverview: PlanCoverageOverview | null;
  planOverviewLoading?: boolean;
}

export default function NudgeBanner({
  planOverview,
  planOverviewLoading = false,
}: NudgeBannerProps) {
  const status = getTimetableStatus(planOverview);

  // Only show nudge for statuses that need attention
  if (planOverviewLoading || status.key === "complete" || status.key === "on_track" || status.key === "no_plan") {
    return null;
  }

  const nudgeText =
    status.key === "needs_attention"
      ? "Some sessions need a little boost"
      : "Several sessions are falling behind";

  const nudgeDetail =
    status.key === "needs_attention"
      ? "A gentle check in could help get things back on track."
      : "Consider reviewing the schedule to catch up.";

  return (
    <div className="bg-neutral-800 rounded-xl px-4 py-3 flex items-center gap-3 max-w-md">
      <div className="flex-shrink-0">
        <AppIcon name="triangle-alert" className="w-5 h-5 text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-0 leading-tight">
          Nudge: {nudgeText}
        </p>
        <p className="text-xs text-neutral-400 mt-0.5 leading-tight">
          {nudgeDetail}
        </p>
      </div>
      <Button variant="secondary" size="sm">
        Ask AI Tutor
      </Button>
    </div>
  );
}
