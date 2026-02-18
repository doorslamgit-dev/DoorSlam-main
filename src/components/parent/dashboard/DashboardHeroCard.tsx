// src/components/parent/dashboard/DashboardHeroCard.tsx
// "This Week's Story" — compact hero card matching design wireframe


import AppIcon from '../../ui/AppIcon';
import type {
  ChildSummary,
  DailyPattern,
  SubjectCoverage,
} from '../../../types/parent/parentDashboardTypes';
import type { PlanCoverageOverview } from '../../../services/timetableService';

interface DashboardHeroCardProps {
  child: ChildSummary | null;
  dailyPattern: DailyPattern[];
  childCoverage: SubjectCoverage[];
  onActionClick: (action: string) => void;
  onViewDetailedBreakdown: () => void;
  planOverview?: PlanCoverageOverview | null;
  onSetupSchedule?: () => void;
  onInviteChild?: () => void;
  loading?: boolean;
}

function HeroSkeleton() {
  return (
    <div className="bg-neutral-0 rounded-2xl shadow-card p-5 border border-neutral-200/50 animate-pulse h-full">
      <div className="h-5 bg-neutral-200 rounded w-40 mb-3" />
      <div className="h-3 bg-neutral-100 rounded w-64 mb-4" />
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-8 w-12 bg-neutral-100 rounded-lg flex-1" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="h-16 bg-neutral-100 rounded-lg" />
        <div className="h-16 bg-neutral-100 rounded-lg" />
        <div className="h-16 bg-neutral-100 rounded-lg" />
      </div>
    </div>
  );
}

function generateHeroSentence(child: ChildSummary): string {
  const completed = child.week_sessions_completed;
  const total = child.week_sessions_total;

  if (total === 0) return 'No sessions planned this week yet.';
  const rate = Math.round((completed / total) * 100);
  if (completed === total) return `All ${total} sessions completed — fantastic effort!`;
  if (rate >= 75) return `${completed} of ${total} sessions done — strong progress.`;
  if (rate >= 50) return `Halfway there with ${completed} of ${total} sessions.`;
  if (completed > 0) return `${completed} of ${total} sessions completed so far.`;
  return `${total} sessions planned — time to get started!`;
}

/** Get the Monday-based week label, e.g. "Week 12 February" */
function getWeekLabel(): string {
  const now = new Date();
  const weekNum = getISOWeek(now);
  const month = now.toLocaleString('en-GB', { month: 'long' });
  return `Week ${weekNum} ${month}`;
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function NextBestAction({
  child,
  planOverview,
  onSetupSchedule,
  onInviteChild,
  onActionClick,
}: {
  child: ChildSummary;
  planOverview?: PlanCoverageOverview | null;
  onSetupSchedule?: () => void;
  onInviteChild?: () => void;
  onActionClick: (action: string) => void;
}) {
  const needsSchedule =
    !planOverview ||
    planOverview.status === 'no_plan' ||
    planOverview.totals.planned_sessions === 0;
  const needsInvite = !needsSchedule && child.auth_user_id === null;

  if (needsSchedule) {
    return (
      <div className="bg-primary-50 rounded-lg p-3 mt-auto border border-primary-200/50">
        <div className="flex items-center gap-1.5 mb-1">
          <AppIcon name="calendar-plus" className="w-3.5 h-3.5 text-primary-600" />
          <span className="text-xs font-semibold text-neutral-700">Next Best Action</span>
        </div>
        <p className="text-xs text-neutral-500 mb-2.5">
          Complete {child.first_name}&apos;s revision schedule to start generating sessions.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onSetupSchedule}
            className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium text-xs"
          >
            Complete Schedule Setup
          </button>
          <button
            disabled
            className="px-3 py-1.5 bg-neutral-100 text-neutral-400 rounded-lg font-medium text-xs cursor-not-allowed"
            title="Complete the schedule first"
          >
            Invite {child.first_name}
          </button>
        </div>
      </div>
    );
  }

  if (needsInvite) {
    return (
      <div className="bg-accent-green/5 rounded-lg p-3 mt-auto border border-accent-green/20">
        <div className="flex items-center gap-1.5 mb-1">
          <AppIcon name="user-plus" className="w-3.5 h-3.5 text-accent-green" />
          <span className="text-xs font-semibold text-neutral-700">Next Best Action</span>
        </div>
        <p className="text-xs text-neutral-500 mb-2.5">
          Schedule is ready! Invite {child.first_name} so they can start their sessions.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onInviteChild}
            className="px-3 py-1.5 bg-accent-green text-white rounded-lg hover:opacity-90 transition font-medium text-xs"
          >
            Invite {child.first_name}
          </button>
          <button
            onClick={() => onActionClick('adjust-plan')}
            className="px-3 py-1.5 bg-neutral-0 border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-100 transition font-medium text-xs"
          >
            Review Schedule
          </button>
        </div>
      </div>
    );
  }

  // Fully set up — normal action buttons
  return (
    <div className="bg-neutral-50 rounded-lg p-3 mt-auto">
      <div className="flex items-center gap-1.5 mb-1">
        <AppIcon name="lightbulb" className="w-3.5 h-3.5 text-warning" />
        <span className="text-xs font-semibold text-neutral-700">Next Best Action</span>
      </div>
      <p className="text-xs text-neutral-500 mb-2.5">
        {child.insight_message || 'Keep up the current routine.'}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onActionClick('adjust-plan')}
          className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium text-xs"
        >
          Adjust Next Week&apos;s Plan
        </button>
        <button
          onClick={() => onActionClick('keep-plan')}
          className="px-3 py-1.5 bg-neutral-0 border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-100 transition font-medium text-xs"
        >
          Keep Plan As-Is
        </button>
        <button
          onClick={() => onActionClick('review-topics')}
          className="px-3 py-1.5 bg-neutral-0 border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-100 transition font-medium text-xs"
        >
          Review Tricky Topics
        </button>
        <button
          onClick={() => onActionClick('export')}
          className="px-3 py-1.5 bg-neutral-0 border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-100 transition font-medium text-xs"
        >
          Export Report
        </button>
      </div>
    </div>
  );
}

export function DashboardHeroCard({
  child,
  dailyPattern,
  childCoverage: _childCoverage,
  onActionClick,
  planOverview,
  onSetupSchedule,
  onInviteChild,
  loading = false,
}: DashboardHeroCardProps) {
  if (loading || !child) return <HeroSkeleton />;

  const heroSentence = child.hero_sentence || generateHeroSentence(child);
  const sessionsCompleted = child.week_sessions_completed;
  const sessionsTotal = child.week_sessions_total;

  // Determine today's day index (0=Mon ... 6=Sun)
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <div className="bg-neutral-0 rounded-2xl shadow-card p-5 border border-neutral-200/50 h-full flex flex-col">
      {/* Header row: title + week nav */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-bold text-neutral-800">This Week&apos;s Story</h2>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>{getWeekLabel()}</span>
          <AppIcon name="calendar" className="w-3.5 h-3.5 text-neutral-400" />
          <button className="p-0.5 hover:bg-neutral-100 rounded" aria-label="Previous week">
            <AppIcon name="chevron-left" className="w-3.5 h-3.5 text-neutral-400" />
          </button>
          <button className="p-0.5 hover:bg-neutral-100 rounded" aria-label="Next week">
            <AppIcon name="chevron-right" className="w-3.5 h-3.5 text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Narrative one-liner */}
      <p className="text-sm text-neutral-500 mb-3">{heroSentence}</p>

      {/* Compact day strip */}
      {dailyPattern.length > 0 && (
        <div className="flex gap-1.5 mb-4">
          {dailyPattern.map((day, idx) => {
            const isToday = idx === todayIdx;
            const isDone = day.sessions_completed >= day.sessions_total && day.sessions_total > 0;
            const inProgress = !isDone && day.sessions_completed > 0;

            let pillClass = 'bg-neutral-100 text-neutral-500';
            let label = day.day_name_short;

            if (isDone) {
              pillClass = 'bg-primary-600 text-white';
            } else if (inProgress) {
              pillClass = 'bg-primary-100 text-primary-700';
              label = 'In Progress';
            } else if (isToday) {
              pillClass = 'bg-neutral-200 text-neutral-700';
            }

            return (
              <div
                key={day.day_of_week}
                className={`flex-1 text-center py-1.5 rounded-lg text-xs font-medium ${pillClass}`}
              >
                {label}
              </div>
            );
          })}
        </div>
      )}

      {/* 3 compact KPI cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-[11px] text-neutral-500 mb-1">Sessions Completed</p>
          <p className="text-lg font-bold text-primary-900">
            {sessionsCompleted}/{sessionsTotal}
          </p>
          <p className="text-[10px] text-neutral-400">
            {sessionsTotal > 0
              ? `${Math.round((sessionsCompleted / sessionsTotal) * 100)}% completion rate`
              : 'None planned'}
          </p>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-[11px] text-neutral-500 mb-1">Avg Confidence Change</p>
          <p className="text-lg font-bold text-accent-green">0%</p>
          <p className="text-[10px] text-neutral-400">Pre → Post session growth</p>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-[11px] text-neutral-500 mb-1">Focus Mode Usage</p>
          <p className="text-lg font-bold text-primary-900">0/0</p>
          <p className="text-[10px] text-neutral-400">
            Used in 0% of sessions
          </p>
        </div>
      </div>

      {/* Next Best Action — conditional based on setup state */}
      <NextBestAction
        child={child}
        planOverview={planOverview}
        onSetupSchedule={onSetupSchedule}
        onInviteChild={onInviteChild}
        onActionClick={onActionClick}
      />
    </div>
  );
}

export default DashboardHeroCard;
