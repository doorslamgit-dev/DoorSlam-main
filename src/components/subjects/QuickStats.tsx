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
    <div className="bg-neutral-0 rounded-2xl shadow-soft p-6">
      <h3 className="text-lg font-semibold mb-4 text-neutral-700">
        Quick Stats
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AppIcon name="check-circle" className="w-4 h-4" />
            <span className="text-sm text-neutral-500">
              Subjects on track
            </span>
          </div>
          <span className="text-sm font-medium text-accent-green">
            {subjectsOnTrack} of {totalSubjects}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AppIcon name="triangle-alert" className="w-4 h-4" />
            <span className="text-sm text-neutral-500">
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
            <span className="text-sm text-neutral-500">
              Average coverage
            </span>
          </div>
          <span className="text-sm font-medium text-neutral-700">
            {avgCoverage}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AppIcon name="calendar" className="w-4 h-4" />
            <span className="text-sm text-neutral-500">
              Time until exams
            </span>
          </div>
          <span className="text-sm font-medium text-neutral-700">
            {weeksUntilExams} weeks
          </span>
        </div>
      </div>
    </div>
  );
}
