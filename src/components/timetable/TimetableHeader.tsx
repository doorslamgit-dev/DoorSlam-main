import type { PlanCoverageOverview } from "../../services/timetableService";
import { getTimetableStatus } from "../../utils/timetableUtils";

interface TimetableHeaderProps {
  planOverview: PlanCoverageOverview | null;
  planOverviewLoading?: boolean;
}

export function TimetableHeader({
  planOverview,
  planOverviewLoading = false,
}: TimetableHeaderProps) {
  const status = getTimetableStatus(planOverview);

  const subtitle =
    planOverviewLoading
      ? "Loading plan status..."
      : status.key === "no_plan"
        ? "No revision plan found"
        : status.description;

  return (
    <div className="mb-4">
      <h1 className="text-2xl font-bold text-primary">Timetable</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
