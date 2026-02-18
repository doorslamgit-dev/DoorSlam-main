// src/components/parent/dashboard/DashboardRevisionPlan.tsx
// Dashboard-specific Revision Plan: progress by subject (left) + coming up sessions (right)


import AppIcon from '../../ui/AppIcon';
import { getSubjectIcon } from '../../../constants/icons';
import { getSubjectColor } from '../../../constants/colors';
import type { PlanCoverageOverview } from '../../../services/timetableService';
import type { ComingUpSession } from '../../../types/parent/parentDashboardTypes';

interface DashboardRevisionPlanProps {
  planOverview: PlanCoverageOverview | null;
  comingUp: ComingUpSession[];
  loading?: boolean;
  onEditSchedule?: () => void;
}

export function DashboardRevisionPlan({
  planOverview,
  comingUp,
  loading = false,
  onEditSchedule: _onEditSchedule,
}: DashboardRevisionPlanProps) {
  if (loading) {
    return (
      <div className="bg-neutral-0 rounded-2xl shadow-card p-5 animate-pulse">
        <div className="flex gap-4 mb-4">
          <div className="w-14 h-14 bg-neutral-200 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-neutral-200 rounded w-36" />
            <div className="h-3 bg-neutral-100 rounded w-48" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 bg-neutral-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  // No plan state
  if (!planOverview || planOverview.status === 'no_plan') {
    return (
      <div className="bg-neutral-0 rounded-2xl shadow-card p-5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-neutral-100 rounded-xl flex flex-col items-center justify-center text-neutral-400">
            <AppIcon name="triangle-alert" className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-medium">No Plan</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-700">No Revision Plan Found</h2>
            <p className="text-xs text-neutral-500">Create a revision plan to see progress.</p>
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
    <div className="bg-neutral-0 rounded-2xl shadow-card p-5">
      <div className="flex flex-col lg:flex-row lg:gap-6">
        {/* Left: Revision Plan progress */}
        <div className="flex-1 min-w-0">
          {/* Header: badge + title + completion */}
          <div className="flex items-start gap-3 mb-3">
            <div
              className={`w-12 h-12 ${status.color} rounded-xl flex flex-col items-center justify-center text-white shrink-0`}
            >
              <AppIcon name={status.icon} className="w-4 h-4 mb-0.5" />
              <span className="text-[8px] font-semibold uppercase tracking-wide leading-tight">
                {status.label}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-800">Revision Plan</h2>
                  <p className="text-xs text-neutral-500">
                    {weeksRemaining > 0 ? `${Math.round(weeksRemaining)} weeks until exams` : 'Exam period'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-neutral-800">{completionPercent}%</span>
                  <p className="text-[10px] text-neutral-500">complete</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${status.color}`}
                  style={{ width: `${Math.max(completionPercent, 0)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Progress by Subject */}
          <h3 className="text-xs font-semibold text-neutral-600 mb-2 mt-3">Progress by Subject</h3>
          <div className="space-y-2">
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
                  <span className="text-xs font-medium text-neutral-700 w-28 truncate shrink-0">
                    {subject.subject_name}
                  </span>
                  <div className="flex-1 h-4 bg-neutral-100 rounded-full overflow-hidden relative">
                    <div
                      className="h-full rounded-full bg-accent-green transition-all duration-500"
                      style={{ width: `${Math.max(subject.completion_percent, 0)}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-neutral-600">
                      {subject.completed_sessions} / {subject.planned_sessions}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-500 w-10 text-right shrink-0">
                    {subject.remaining_sessions} left
                  </span>
                </div>
              );
            })}
          </div>

          {/* Schedule status banner */}
          <div className={`${status.bgLight} border ${status.borderColor} rounded-lg p-2.5 mt-3`}>
            <div className="flex items-center gap-2">
              <AppIcon
                name={status.isHealthy ? 'circle-check' : 'clock'}
                className={`w-3.5 h-3.5 ${status.textColor}`}
              />
              <p className="text-xs text-neutral-700">
                <strong className="text-neutral-800">{scheduledPerWeek} sessions/week</strong>
                {' '}Scheduled
                {neededPerWeek > 0 && (
                  <span className="text-neutral-500"> · {neededPerWeek}/week needed for full coverage</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Coming Up sessions */}
        <div className="lg:w-56 shrink-0 mt-4 lg:mt-0 lg:border-l lg:border-neutral-100 lg:pl-5">
          {comingUp.length > 0 ? (
            <div className="space-y-2.5">
              {comingUp.slice(0, 4).map((session) => (
                <div key={session.planned_session_id} className="flex items-center gap-2.5">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${getSubjectColor(session.subject_name)}20` }}
                  >
                    <AppIcon
                      name={getSubjectIcon(session.subject_icon)}
                      className="w-3 h-3"
                      style={{ color: getSubjectColor(session.subject_name) }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-700 truncate">{session.subject_name}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{session.topic_name}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${
                    session.is_today
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {session.is_today ? 'Today' : session.is_tomorrow ? 'Tomorrow' : session.day_label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-400 text-center py-4">No upcoming sessions</p>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatus(completionPercent: number, scheduleGap: number) {
  if (completionPercent >= 100) {
    return {
      color: 'bg-accent-green', textColor: 'text-accent-green',
      borderColor: 'border-accent-green', bgLight: 'bg-success-bg',
      icon: 'circle-check' as const, label: 'Complete', isHealthy: true,
    };
  }
  if (scheduleGap >= 0) {
    return {
      color: 'bg-accent-green', textColor: 'text-accent-green',
      borderColor: 'border-accent-green', bgLight: 'bg-success-bg',
      icon: 'circle-check' as const, label: 'On Track', isHealthy: true,
    };
  }
  if (scheduleGap >= -3) {
    return {
      color: 'bg-accent-amber', textColor: 'text-accent-amber',
      borderColor: 'border-accent-amber', bgLight: 'bg-warning-bg',
      icon: 'triangle-alert' as const, label: 'Attention', isHealthy: false,
    };
  }
  return {
    color: 'bg-accent-red', textColor: 'text-accent-red',
    borderColor: 'border-accent-red', bgLight: 'bg-danger-bg',
    icon: 'flame' as const, label: 'Behind', isHealthy: false,
  };
}

export default DashboardRevisionPlan;
