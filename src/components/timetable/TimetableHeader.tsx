import AppIcon from "../ui/AppIcon";
import Badge from "../ui/Badge";
import type { ChildOption, PlanCoverageOverview } from "../../services/timetableService";
import { getTimetableStatus } from "../../utils/timetableUtils";

interface TimetableHeaderProps {
  children: ChildOption[];
  selectedChildId: string | null;
  onChildChange: (childId: string) => void;
  planOverview: PlanCoverageOverview | null;
  planOverviewLoading?: boolean;
}

export function TimetableHeader({
  children,
  selectedChildId,
  onChildChange,
  planOverview,
  planOverviewLoading = false,
}: TimetableHeaderProps) {
  const status = getTimetableStatus(planOverview);

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-900">
            Revision Timetable
          </h1>
          <p className="text-neutral-600">Weekly schedule and session planning</p>
        </div>

        {/* Status Badge */}
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

      {/* Child Selector */}
      <div className="relative flex items-center px-4 py-2 rounded-full border cursor-pointer bg-primary-50 border-primary-100">
        <select
          value={selectedChildId || ""}
          onChange={(e) => onChildChange(e.target.value)}
          className="appearance-none bg-transparent border-none font-medium focus:outline-none cursor-pointer pr-6 text-primary-600"
        >
          {children.map((child) => (
            <option key={child.child_id} value={child.child_id}>
              {child.child_name}
            </option>
          ))}
        </select>
        <AppIcon
          name="chevron-down"
          className="absolute right-4 w-3 h-3 pointer-events-none text-primary-600"
        />
      </div>
    </div>
  );
}
