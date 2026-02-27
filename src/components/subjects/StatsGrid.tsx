// src/components/subjects/StatsGrid.tsx
// Updated: AppIcon-only (no FontAwesome)
// Updated: Token-based colors
// Updated: Design system card styling (rounded-2xl, shadow-soft, p-6)

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
      <div className="bg-background rounded-2xl p-6 shadow-sm border border-border">
        <div className="mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <AppIcon name="book" className="w-5 h-5 text-primary" aria-hidden />
          </div>
        </div>
        <div className="text-lg font-bold text-foreground">
          {totalSubjects} subject{totalSubjects !== 1 ? "s" : ""}
        </div>
        <div className="text-sm text-muted-foreground">Active Coverage</div>
      </div>

      {/* Sessions This Week Card */}
      <div className="bg-background rounded-2xl p-6 shadow-sm border border-border">
        <div className="mb-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <AppIcon
              name="calendar-check"
              className="w-5 h-5 text-success"
              aria-hidden
            />
          </div>
        </div>
        <div className="text-lg font-bold text-foreground">
          {sessionsThisWeek} session{sessionsThisWeek !== 1 ? "s" : ""}
        </div>
        <div className="text-sm text-muted-foreground">Completed This Week</div>
      </div>

      {/* Topics Covered Card */}
      <div className="bg-background rounded-2xl p-6 shadow-sm border border-border">
        <div className="mb-3">
          <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
            <AppIcon
              name="chart-bar"
              className="w-5 h-5 text-info"
              aria-hidden
            />
          </div>
        </div>
        <div className="text-lg font-bold text-foreground">
          {topicsCoveredThisWeek} topic{topicsCoveredThisWeek !== 1 ? "s" : ""}
        </div>
        <div className="text-sm text-muted-foreground">Covered This Week</div>
      </div>

      {/* Coverage Status Card */}
      <div className="bg-background rounded-2xl p-6 shadow-sm border border-border">
        <div className="mb-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              needsFocus ? "bg-warning/10" : "bg-success/10"
            }`}
          >
            <AppIcon
              name={needsFocus ? "triangle-alert" : "check-circle"}
              className={`w-5 h-5 ${needsFocus ? "text-warning" : "text-success"}`}
              aria-hidden
            />
          </div>
        </div>
        <div className="text-lg font-bold text-foreground">
          {needsFocus
            ? `${subjectsNeedingAttention} need${subjectsNeedingAttention === 1 ? "s" : ""} focus`
            : "All good!"}
        </div>
        <div className="text-sm text-muted-foreground">Subject Coverage</div>
      </div>
    </div>
  );
}
