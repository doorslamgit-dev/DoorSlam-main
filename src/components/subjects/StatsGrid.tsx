// src/components/subjects/StatsGrid.tsx
// Updated: AppIcon-only (no FontAwesome)
// Updated: Token-based colors

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
      <div className="bg-background rounded-xl p-4 shadow-sm border border-border">
        <div className="mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/90/30 flex items-center justify-center">
            <AppIcon name="book" className="w-5 h-5 text-primary dark:text-primary/70" aria-hidden />
          </div>
        </div>
        <div className="text-2xl font-bold text-primary">
          {totalSubjects} subject{totalSubjects !== 1 ? "s" : ""}
        </div>
        <div className="text-sm text-muted-foreground">Active Coverage</div>
      </div>

      {/* Sessions This Week Card */}
      <div className="bg-background rounded-xl p-4 shadow-sm border border-border">
        <div className="mb-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 dark:bg-green-900/30 flex items-center justify-center">
            <AppIcon
              name="calendar-check"
              className="w-5 h-5 text-success"
              aria-hidden
            />
          </div>
        </div>
        <div className="text-2xl font-bold text-primary">
          {sessionsThisWeek} session{sessionsThisWeek !== 1 ? "s" : ""}
        </div>
        <div className="text-sm text-muted-foreground">Completed This Week</div>
      </div>

      {/* Topics Covered Card */}
      <div className="bg-background rounded-xl p-4 shadow-sm border border-border">
        <div className="mb-3">
          <div className="w-10 h-10 rounded-lg bg-info/10 dark:bg-blue-900/30 flex items-center justify-center">
            <AppIcon
              name="chart-bar"
              className="w-5 h-5 text-info dark:text-info"
              aria-hidden
            />
          </div>
        </div>
        <div className="text-2xl font-bold text-primary">
          {topicsCoveredThisWeek} topic{topicsCoveredThisWeek !== 1 ? "s" : ""}
        </div>
        <div className="text-sm text-muted-foreground">Covered This Week</div>
      </div>

      {/* Coverage Status Card */}
      <div className="bg-background rounded-xl p-4 shadow-sm border border-border">
        <div className="mb-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              needsFocus ? "bg-warning/10 dark:bg-amber-900/30" : "bg-success/10 dark:bg-green-900/30"
            }`}
          >
            <AppIcon
              name={needsFocus ? "triangle-alert" : "check-circle"}
              className={`w-5 h-5 ${needsFocus ? "text-warning" : "text-success"}`}
              aria-hidden
            />
          </div>
        </div>

        <div className="text-2xl font-bold text-primary">
          {needsFocus
            ? `${subjectsNeedingAttention} need${subjectsNeedingAttention === 1 ? "s" : ""} focus`
            : "All good!"}
        </div>
        <div className="text-sm text-muted-foreground">Subject Coverage</div>
      </div>
    </div>
  );
}
