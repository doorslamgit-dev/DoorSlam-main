// src/components/subjects/QuickStats.tsx

import AppIcon from "../ui/AppIcon";
import { COLORS } from "../../constants/colors";

interface QuickStatsProps {
  subjectsOnTrack: number;
  totalSubjects: number;
  needsAttention: number;
  avgCoverage: number;
  weeksUntilExams: number;
}

export default function QuickStats({
  subjectsOnTrack,
  totalSubjects,
  needsAttention,
  avgCoverage,
  weeksUntilExams,
}: QuickStatsProps) {
  return (
    <div className="bg-background rounded-2xl shadow-sm border border-border p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        Quick Stats
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AppIcon name="check-circle" className="w-4 h-4" />
            <span className="text-sm text-muted-foreground">
              Subjects on track
            </span>
          </div>
          <span className="text-sm font-medium text-success">
            {subjectsOnTrack} of {totalSubjects}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AppIcon name="triangle-alert" className="w-4 h-4" />
            <span className="text-sm text-muted-foreground">
              Needs attention
            </span>
          </div>
          <span
            className="text-sm font-medium"
            style={{ color: needsAttention > 0 ? COLORS.accent.amber : COLORS.neutral[700] }}
          >
            {needsAttention} subject{needsAttention !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AppIcon name="chart-line" className="w-4 h-4" />
            <span className="text-sm text-muted-foreground">
              Average coverage
            </span>
          </div>
          <span className="text-sm font-medium text-foreground">
            {avgCoverage}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AppIcon name="calendar" className="w-4 h-4" />
            <span className="text-sm text-muted-foreground">
              Time until exams
            </span>
          </div>
          <span className="text-sm font-medium text-foreground">
            {weeksUntilExams} weeks
          </span>
        </div>
      </div>
    </div>
  );
}
