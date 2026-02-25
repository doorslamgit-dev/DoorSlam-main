// src/components/parent/dashboard/DashboardRevisionPlan.tsx
// Dashboard-specific Revision Plan: progress by subject (left) + coming up sessions (right)


import AppIcon from '../../ui/AppIcon';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import type { BadgeVariant } from '../../ui/Badge';
import { getSubjectIcon } from '../../../constants/icons';
import { getSubjectColor } from '../../../constants/colors';
import type { PlanCoverageOverview } from '../../../services/timetableService';

interface DashboardRevisionPlanProps {
  planOverview: PlanCoverageOverview | null;
  loading?: boolean;
  onEditSchedule?: () => void;
}

export function DashboardRevisionPlan({
  planOverview,
  loading = false,
  onEditSchedule: _onEditSchedule,
}: DashboardRevisionPlanProps) {
  if (loading) {
    return (
      <div className="bg-background rounded-2xl shadow-sm p-5 animate-pulse">
        <div className="flex gap-4 mb-4">
          <div className="w-14 h-14 bg-muted rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-muted rounded w-36" />
            <div className="h-3 bg-secondary rounded w-48" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 bg-secondary rounded" />
          ))}
        </div>
      </div>
    );
  }

  // No plan state
  if (!planOverview || planOverview.status === 'no_plan') {
    return (
      <div className="bg-background rounded-2xl shadow-sm p-5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-secondary rounded-xl flex flex-col items-center justify-center text-muted-foreground">
            <AppIcon name="triangle-alert" className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-medium">No Plan</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">No Revision Plan Found</h2>
            <p className="text-xs text-muted-foreground">Create a revision plan to see progress.</p>
          </div>
        </div>
      </div>
    );
  }

  const { totals, subjects, pace, revision_period } = planOverview;
  const weeksRemaining = revision_period?.weeks_remaining || 0;
  const completionPercent = totals.completion_percent || 0;
  const scheduledPerWeek = weeksRemaining > 0
    ? Math.round(totals.planned_sessions / weeksRemaining)
    : 0;
  const neededPerWeek = pace?.sessions_per_week_needed || scheduledPerWeek;

  // Status logic
  const scheduleGap = scheduledPerWeek - neededPerWeek;
  const status = getStatus(completionPercent, scheduleGap);

  // Consolidate subjects
  const consolidated = subjects.reduce((acc, s) => {
    const existing = acc.find((x) => x.subject_name === s.subject_name);
    if (existing) {
      existing.planned_sessions += s.planned_sessions;
      existing.completed_sessions += s.completed_sessions;
      existing.remaining_sessions += s.remaining_sessions;
      existing.completion_percent = existing.planned_sessions > 0
        ? Math.round((existing.completed_sessions / existing.planned_sessions) * 100) : 0;
    } else {
      acc.push({ ...s });
    }
    return acc;
  }, [] as typeof subjects);

  return (
    <div className="bg-background rounded-2xl shadow-sm p-5 h-full flex flex-col">
      {/* Header: title + weeks + status badge */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-foreground">Revision Plan</h2>
          <p className="text-xs text-muted mt-0.5">
            {weeksRemaining > 0 ? `${Math.round(weeksRemaining)} weeks until exams` : 'Exam period'}
          </p>
        </div>
        <Badge variant={status.badgeVariant} badgeStyle="solid" size="sm">
          {status.label}
        </Badge>
      </div>

      {/* Progress by Subject */}
      <h3 className="text-xs font-semibold text-muted mb-2">Progress by Subject</h3>
      <div className="space-y-2 flex-1">
        {consolidated.map((subject, idx) => {
          const color = getSubjectColor(subject.subject_name);
          return (
            <div key={`${subject.subject_name}-${idx}`} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}20` }}
              >
                <AppIcon name={getSubjectIcon(subject.icon)} className="w-3 h-3" style={{ color }} />
              </div>
              <span className="text-xs font-medium text-foreground w-28 truncate shrink-0">
                {subject.subject_name}
              </span>
              <div className="flex-1 h-4 bg-secondary rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full bg-success transition-all duration-500"
                  style={{ width: `${Math.max(subject.completion_percent, 0)}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                  {subject.completed_sessions} / {subject.planned_sessions}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground w-10 text-right shrink-0">
                {subject.remaining_sessions} left
              </span>
            </div>
          );
        })}
      </div>

      {/* Schedule status footer */}
      <div className={`${status.bgLight} border ${status.borderColor} rounded-lg p-2.5 mt-3`}>
        <div className="flex items-center gap-2">
          <AppIcon
            name={status.isHealthy ? 'circle-check' : 'clock'}
            className={`w-3.5 h-3.5 ${status.textColor}`}
          />
          <p className="text-xs text-foreground">
            <strong className="text-foreground">{scheduledPerWeek} sessions/week</strong>
            {' '}Scheduled
            {neededPerWeek > 0 && (
              <span className="text-muted-foreground"> · {neededPerWeek}/week needed for full coverage</span>
            )}
          </p>
        </div>
      </div>

      {/* Ask AI Tutor CTA */}
      <Button variant="primary" size="sm" leftIcon="bot" fullWidth className="mt-3">
        Ask AI Tutor
      </Button>
    </div>
  );
}

interface StatusConfig {
  badgeVariant: BadgeVariant;
  textColor: string;
  borderColor: string;
  bgLight: string;
  icon: 'circle-check' | 'triangle-alert' | 'flame';
  label: string;
  isHealthy: boolean;
}

function getStatus(completionPercent: number, scheduleGap: number): StatusConfig {
  if (completionPercent >= 100) {
    return {
      badgeVariant: 'success', textColor: 'text-success',
      borderColor: 'border-success-border', bgLight: 'bg-success/10',
      icon: 'circle-check', label: 'Complete', isHealthy: true,
    };
  }
  if (scheduleGap >= 0) {
    return {
      badgeVariant: 'success', textColor: 'text-success',
      borderColor: 'border-success-border', bgLight: 'bg-success/10',
      icon: 'circle-check', label: 'On Track', isHealthy: true,
    };
  }
  if (scheduleGap >= -3) {
    return {
      badgeVariant: 'warning', textColor: 'text-warning',
      borderColor: 'border-warning-border', bgLight: 'bg-warning/10',
      icon: 'triangle-alert', label: 'Attention', isHealthy: false,
    };
  }
  return {
    badgeVariant: 'danger', textColor: 'text-destructive',
    borderColor: 'border-danger-border', bgLight: 'bg-destructive/10',
    icon: 'flame', label: 'Behind', isHealthy: false,
  };
}

export default DashboardRevisionPlan;
