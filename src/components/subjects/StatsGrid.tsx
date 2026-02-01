// src/components/subjects/StatsGrid.tsx
// Updated: AppIcon-only (no FontAwesome)

import AppIcon from "../ui/AppIcon";

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
      <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
        <div className="mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
            <AppIcon name="book" className="w-5 h-5 text-primary-600" aria-hidden />
          </div>
        </div>
        <div className="text-2xl font-bold text-primary-900">
          {totalSubjects} subject{totalSubjects !== 1 ? "s" : ""}
        </div>
        <div className="text-sm text-neutral-500">Active Coverage</div>
      </div>

      {/* Sessions This Week Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
        <div className="mb-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <AppIcon
              name="calendar-check"
              className="w-5 h-5 text-[#1EC592]"
              aria-hidden
            />
          </div>
        </div>
        <div className="text-2xl font-bold text-primary-900">
          {sessionsThisWeek} session{sessionsThisWeek !== 1 ? "s" : ""}
        </div>
        <div className="text-sm text-neutral-500">Completed This Week</div>
      </div>

      {/* Topics Covered Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
        <div className="mb-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <AppIcon
              name="chart-bar"
              className="w-5 h-5 text-blue-600"
              aria-hidden
            />
          </div>
        </div>
        <div className="text-2xl font-bold text-primary-900">
          {topicsCoveredThisWeek} topic{topicsCoveredThisWeek !== 1 ? "s" : ""}
        </div>
        <div className="text-sm text-neutral-500">Covered This Week</div>
      </div>

      {/* Coverage Status Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
        <div className="mb-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              needsFocus ? "bg-amber-100" : "bg-green-100"
            }`}
          >
            <AppIcon
              name={needsFocus ? "triangle-alert" : "check-circle"}
              className={`w-5 h-5 ${needsFocus ? "text-[#E69B2C]" : "text-[#1EC592]"}`}
              aria-hidden
            />
          </div>
        </div>

        <div className="text-2xl font-bold text-primary-900">
          {needsFocus
            ? `${subjectsNeedingAttention} need${subjectsNeedingAttention === 1 ? "s" : ""} focus`
            : "All good!"}
        </div>
        <div className="text-sm text-neutral-500">Subject Coverage</div>
      </div>
    </div>
  );
}
