// src/components/timetable/TimetableHeroCard.tsx

import AppIcon from "../ui/AppIcon";
import { getSubjectIcon } from "../../constants/icons";
import { getSubjectColor } from "../../constants/colors";
import type { PlanCoverageOverview } from "../../services/timetableService";

interface TimetableHeroCardProps {
  planOverview: PlanCoverageOverview | null;
  loading?: boolean;
  onEditSchedule?: () => void;
}

export default function TimetableHeroCard({
  planOverview,
  loading = false,
  onEditSchedule,
}: TimetableHeroCardProps) {
  // Loading state
  if (loading) {
    return (
      <div className="bg-background rounded-2xl shadow-sm p-6 mb-6 animate-pulse">
        <div className="flex items-start gap-6 mb-6">
          <div className="w-24 h-24 bg-secondary rounded-2xl" />
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-secondary rounded w-48" />
            <div className="h-4 bg-secondary rounded w-64" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-secondary rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // No data state
  if (!planOverview || planOverview.status === "no_plan") {
    return (
      <div className="bg-background rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-secondary rounded-2xl flex flex-col items-center justify-center text-muted-foreground">
            <AppIcon name="triangle-alert" className="w-8 h-8 mb-1" />
            <span className="text-xs font-medium">No Plan</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Revision Plan Found
            </h2>
            <p className="text-muted-foreground">
              Create a revision plan to see your schedule and progress.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { totals, subjects, pace, revision_period } = planOverview;

  // Calculate schedule metrics
  const weeksRemaining = revision_period?.weeks_remaining || 0;
  const scheduledPerWeek = weeksRemaining > 0 
    ? Math.round(totals.planned_sessions / weeksRemaining) 
    : 0;
  const neededPerWeek = pace?.sessions_per_week_needed || scheduledPerWeek;
  
  // Determine actual status based on schedule vs need
  const scheduleGap = scheduledPerWeek - neededPerWeek;
  const completionPercent = totals.completion_percent || 0;
  
  // Status logic:
  // - Complete: All done
  // - On Track: scheduled >= needed (or very close)
  // - Needs Attention: scheduled < needed by a small margin
  // - Behind: scheduled significantly < needed
  const getStatus = () => {
    if (completionPercent >= 100) {
      return {
        key: "complete",
        color: "bg-success",
        textColor: "text-success",
        borderColor: "border-success",
        bgLight: "bg-success/10",
        icon: "circle-check",
        label: "Complete!",
        description: "All sessions completed. Excellent work!",
        isHealthy: true,
      };
    }
    
    if (scheduleGap >= 0) {
      return {
        key: "on_track",
        color: "bg-success",
        textColor: "text-success",
        borderColor: "border-success",
        bgLight: "bg-success/10",
        icon: "circle-check",
        label: "On Track",
        description: `Your schedule covers ${scheduledPerWeek} sessions/week`,
        isHealthy: true,
      };
    }
    
    if (scheduleGap >= -3) {
      return {
        key: "needs_attention",
        color: "bg-warning",
        textColor: "text-warning",
        borderColor: "border-warning",
        bgLight: "bg-warning/10",
        icon: "triangle-alert",
        label: "Needs Attention",
        description: `${Math.abs(scheduleGap)} more sessions/week recommended`,
        isHealthy: false,
      };
    }
    
    return {
      key: "behind",
      color: "bg-destructive",
      textColor: "text-destructive",
      borderColor: "border-destructive",
      bgLight: "bg-destructive/10",
      icon: "flame",
      label: "Behind Schedule",
      description: `${Math.abs(scheduleGap)} more sessions/week needed`,
      isHealthy: false,
    };
  };

  const status = getStatus();

  // Consolidate subjects with same name
  const consolidatedSubjects = subjects.reduce((acc, subject) => {
    const existing = acc.find(s => s.subject_name === subject.subject_name);
    if (existing) {
      existing.planned_sessions += subject.planned_sessions;
      existing.completed_sessions += subject.completed_sessions;
      existing.remaining_sessions += subject.remaining_sessions;
      existing.total_minutes += subject.total_minutes;
      existing.completion_percent = existing.planned_sessions > 0
        ? Math.round((existing.completed_sessions / existing.planned_sessions) * 100)
        : 0;
    } else {
      acc.push({ ...subject });
    }
    return acc;
  }, [] as typeof subjects);

  return (
    <div className="bg-background rounded-2xl shadow-sm p-6 mb-6">
      {/* Header Row: Status Badge + Title + Key Stats */}
      <div className="flex items-start gap-5 mb-6">
        {/* Status Indicator */}
        <div
          className={`w-20 h-20 ${status.color} rounded-2xl flex flex-col items-center justify-center text-primary-foreground shrink-0`}
        >
          <AppIcon name={status.icon} className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-center leading-tight px-1">
            {status.label}
          </span>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Revision Plan
              </h2>
              <p className="text-sm text-muted-foreground">
                {weeksRemaining > 0
                  ? `${Math.round(weeksRemaining)} weeks until exams`
                  : "Exam period"}
              </p>
            </div>

            {/* Completion Badge */}
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {completionPercent}%
              </div>
              <div className="text-xs text-muted-foreground">complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-secondary rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all duration-500 ${status.color}`}
              style={{ width: `${Math.max(completionPercent, 0)}%` }}
            />
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">
                {totals.planned_sessions}
              </div>
              <div className="text-[11px] text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-success">
                {totals.completed_sessions}
              </div>
              <div className="text-[11px] text-muted-foreground">Done</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-muted-foreground">
                {totals.remaining_sessions}
              </div>
              <div className="text-[11px] text-muted-foreground">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-muted-foreground">
                {scheduledPerWeek}
              </div>
              <div className="text-[11px] text-muted-foreground">Per Week</div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Status Banner */}
      <div className={`${status.bgLight} border ${status.borderColor} rounded-xl p-4 mb-5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppIcon
              name={status.isHealthy ? "circle-check" : "clock"}
              className={`w-4 h-4 ${status.textColor}`}
            />
            <div>
              {status.isHealthy ? (
                <p className="text-sm text-foreground">
                  <strong className="text-foreground">{scheduledPerWeek} sessions/week</strong> scheduled
                  {neededPerWeek > 0 && (
                    <span className="text-muted-foreground"> • {neededPerWeek}/week needed for full coverage</span>
                  )}
                </p>
              ) : (
                <p className="text-sm text-foreground">
                  You have <strong>{scheduledPerWeek} sessions/week</strong> but need{" "}
                  <strong>{neededPerWeek}/week</strong> for full coverage
                </p>
              )}
            </div>
          </div>

          {/* CTA Button when behind */}
          {!status.isHealthy && onEditSchedule && (
            <button
              onClick={onEditSchedule}
              className="flex items-center gap-2 px-4 py-2 bg-background border border-input rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:border-border transition-colors shrink-0"
            >
              <AppIcon name="sliders-horizontal" className="w-3 h-3" />
              Adjust Schedule
            </button>
          )}
        </div>
      </div>

      {/* Subject Progress Section */}
      {consolidatedSubjects.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Progress by Subject
          </h3>
          <div className="space-y-3">
            {consolidatedSubjects.map((subject, idx) => {
              const color = getSubjectColor(subject.subject_name);
              return (
                <div key={`${subject.subject_name}-${idx}`} className="flex items-center gap-3">
                  {/* Subject Icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <AppIcon
                      name={getSubjectIcon(subject.icon)}
                      className="w-4 h-4"
                      style={{ color: color }}
                    />
                  </div>

                {/* Subject Name */}
                <div className="w-32 shrink-0">
                  <span className="text-sm font-medium text-foreground truncate block">
                    {subject.subject_name}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="flex-1 h-6 bg-secondary rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-success"
                    style={{
                      width: `${Math.max(subject.completion_percent, 0)}%`,
                    }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground">
                    {subject.completed_sessions} / {subject.planned_sessions}
                  </span>
                </div>

                  {/* Remaining */}
                  <div className="w-16 text-right shrink-0">
                    <span className="text-sm text-muted-foreground">
                      {subject.remaining_sessions} left
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}