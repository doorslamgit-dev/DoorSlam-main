// src/components/timetable/TimetableActionCards.tsx

import Button from "../ui/Button";
import Badge from "../ui/Badge";
import type { PlanCoverageOverview } from "../../services/timetableService";
import { getTimetableStatus } from "../../utils/timetableUtils";

interface TimetableActionCardsProps {
  onAddSession: () => void;
  onEditSchedule: () => void;
  onBlockDates: () => void;
  planOverview: PlanCoverageOverview | null;
  planOverviewLoading?: boolean;
}

export default function TimetableActionCards({
  onAddSession,
  onEditSchedule,
  onBlockDates,
  planOverview,
  planOverviewLoading = false,
}: TimetableActionCardsProps) {
  const status = getTimetableStatus(planOverview);

  return (
    <div className="flex items-center justify-between mb-4">
      {/* Left: action buttons */}
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          leftIcon="plus-circle"
          onClick={onAddSession}
        >
          Add Session
        </Button>
        <Button
          variant="secondary"
          size="sm"
          leftIcon="calendar"
          onClick={onEditSchedule}
        >
          Edit Schedule
        </Button>
        <Button
          variant="secondary"
          size="sm"
          leftIcon="calendar-x"
          onClick={onBlockDates}
        >
          Block Dates
        </Button>
      </div>

      {/* Right: status badge */}
      {!planOverviewLoading && status.key !== "no_plan" && (
        <Badge
          variant={status.badgeVariant}
          badgeStyle="soft"
          size="md"
          icon={status.icon}
        >
          {status.label}
        </Badge>
      )}
    </div>
  );
}
