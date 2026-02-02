// src/components/subjects/StatsGrid.tsx
// Updated: AppIcon-only (no FontAwesome)
// Updated: Token-based colors

import AppIcon from "../ui/AppIcon";
import { COLORS } from "../../constants/colors";

interface StatsGridProps {
  totalSubjects: number;
  sessionsThisWeek: number;
  topicsCoveredThisWeek: number;
  subjectsNeedingAttention: number;
}

export function StatsGrid({
  totalSubjects,
  sessionsThisWeek,
  topicsCoveredThisWeek,
  subjectsNeedingAttention,
}: StatsGridProps) {
  const needsFocus = subjectsNeedingAttention > 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Subjects Card */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm border border-neutral-100 dark:border-neutral-700">
        <div className="mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <AppIcon name="book" className="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden />
          </div>
        </div>
        <div className="text-2xl font-bold text-primary-900 dark:text-neutral-100">
          {totalSubjects} subject{totalSubjects !== 1 ? "s" : ""}
        </div>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">Active Coverage</div>
      </div>

      {/* Sessions This Week Card */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm border border-neutral-100 dark:border-neutral-700">
        <div className="mb-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <AppIcon
              name="calendar-check"
              className="w-5 h-5 text-accent-green"
              aria-hidden
            />
          </div>
        </div>
        <div className="text-2xl font-bold text-primary-900 dark:text-neutral-100">
          {sessionsThisWeek} session{sessionsThisWeek !== 1 ? "s" : ""}
        </div>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">Completed This Week</div>
      </div>

      {/* Topics Covered Card */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm border border-neutral-100 dark:border-neutral-700">
        <div className="mb-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <AppIcon
              name="chart-bar"
              className="w-5 h-5 text-blue-600 dark:text-blue-400"
              aria-hidden
            />
          </div>
        </div>
        <div className="text-2xl font-bold text-primary-900 dark:text-neutral-100">
          {topicsCoveredThisWeek} topic{topicsCoveredThisWeek !== 1 ? "s" : ""}
        </div>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">Covered This Week</div>
      </div>

      {/* Coverage Status Card */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm border border-neutral-100 dark:border-neutral-700">
        <div className="mb-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              needsFocus ? "bg-amber-100 dark:bg-amber-900/30" : "bg-green-100 dark:bg-green-900/30"
            }`}
          >
            <AppIcon
              name={needsFocus ? "triangle-alert" : "check-circle"}
              className={`w-5 h-5 ${needsFocus ? "text-accent-amber" : "text-accent-green"}`}
              aria-hidden
            />
          </div>
        </div>

        <div className="text-2xl font-bold text-primary-900 dark:text-neutral-100">
          {needsFocus
            ? `${subjectsNeedingAttention} need${subjectsNeedingAttention === 1 ? "s" : ""} focus`
            : "All good!"}
        </div>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">Subject Coverage</div>
      </div>
    </div>
  );
}
