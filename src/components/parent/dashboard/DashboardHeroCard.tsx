// src/components/parent/dashboard/DashboardHeroCard.tsx
// "This Week's Story" — hero card with KPI stats and next best action

import AppIcon from '../../ui/AppIcon';
import Button from '../../ui/Button';
import StatCard from '../../ui/StatCard';
import type {
  ChildSummary,
  SubjectCoverage,
  DailyPattern,
} from '../../../types/parent/parentDashboardTypes';
import type { PlanCoverageOverview } from '../../../services/timetableService';

interface DashboardHeroCardProps {
  child: ChildSummary | null;
  childCoverage: SubjectCoverage[];
  dailyPattern: DailyPattern[];
  onActionClick: (action: string) => void;
  onViewDetailedBreakdown: () => void;
  planOverview?: PlanCoverageOverview | null;
  onSetupSchedule?: () => void;
  onInviteChild?: () => void;
  loading?: boolean;
}

function HeroSkeleton() {
  return (
    <div className="bg-background rounded-2xl shadow-sm p-5 border border-border animate-pulse h-full">
      <div className="h-5 bg-muted rounded w-40 mb-3" />
      <div className="h-3 bg-secondary rounded w-64 mb-6" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-16 bg-secondary rounded-lg" />
        <div className="h-16 bg-secondary rounded-lg" />
        <div className="h-16 bg-secondary rounded-lg" />
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

function DayStrip({ dailyPattern }: { dailyPattern: DailyPattern[] }) {
  if (dailyPattern.length === 0) return null;

  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <div className="grid grid-cols-7 gap-2">
      {dailyPattern.map((day, idx) => {
        const isToday = idx === todayIdx;
        const isDone = day.sessions_completed >= day.sessions_total && day.sessions_total > 0;
        const inProgress = !isDone && day.sessions_completed > 0;
        const hasContent = day.sessions_total > 0;

        let cellClass = 'bg-muted border border-border text-muted-foreground';
        let cellContent: React.ReactNode = '\u2013';
        let labelClass = 'text-muted-foreground';

        if (isDone) {
          cellClass = 'bg-success border-0 text-white';
          cellContent = <AppIcon name="check" className="w-3.5 h-3.5 mx-auto" />;
        } else if (inProgress) {
          cellClass = 'bg-primary/10 border border-primary/20 text-primary';
          cellContent = `${day.sessions_completed}/${day.sessions_total}`;
        } else if (isToday && hasContent) {
          cellClass = 'bg-primary border-0 text-primary-foreground';
          cellContent = `${day.sessions_completed}/${day.sessions_total}`;
          labelClass = 'text-foreground font-semibold';
        } else if (isToday) {
          cellClass = 'bg-muted border-0 text-muted-foreground';
          labelClass = 'text-foreground font-semibold';
        }

        return (
          <div key={day.day_of_week} className="flex flex-col items-center gap-1">
            <span className={`text-[11px] font-medium ${labelClass}`}>
              {isToday ? 'Today' : day.day_name_short}
            </span>
            <div
              className={`w-full h-9 rounded-lg flex items-center justify-center text-xs font-semibold ${cellClass}`}
            >
              {cellContent}
            </div>
          </div>
        );
      })}
    </div>
  );
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
      <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
        <div className="flex items-center gap-1.5 mb-1">
          <AppIcon name="calendar-plus" className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">Next Best Action</span>
        </div>
        <p className="text-xs text-muted-foreground mb-2.5">
          Complete {child.first_name}&apos;s revision schedule to start generating sessions.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm" onClick={onSetupSchedule}>
            Complete Schedule Setup
          </Button>
          <Button variant="secondary" size="sm" disabled title="Complete the schedule first">
            Invite {child.first_name}
          </Button>
        </div>
      </div>
    );
  }

  if (needsInvite) {
    return (
      <div className="bg-success/10 rounded-lg p-3 border border-success/20">
        <div className="flex items-center gap-1.5 mb-1">
          <AppIcon name="user-plus" className="w-3.5 h-3.5 text-success" />
          <span className="text-xs font-semibold text-foreground">Next Best Action</span>
        </div>
        <p className="text-xs text-muted-foreground mb-2.5">
          Schedule is ready! Invite {child.first_name} so they can start their sessions.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm" onClick={onInviteChild}>
            Invite {child.first_name}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onActionClick('adjust-plan')}>
            Review Schedule
          </Button>
        </div>
      </div>
    );
  }

  // Fully set up — normal action buttons
  return (
    <div className="bg-muted rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs font-semibold text-foreground">Next Best Action</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={() => onActionClick('adjust-plan')}>
          Adjust Next Week&apos;s Plan
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onActionClick('keep-plan')}>
          Keep Plan As-Is
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onActionClick('review-topics')}>
          Review Tricky Topics
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onActionClick('export')}>
          Export Report
        </Button>
      </div>
    </div>
  );
}

export function DashboardHeroCard({
  child,
  childCoverage: _childCoverage,
  dailyPattern,
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

  return (
    <div className="bg-background rounded-2xl shadow-sm p-5 border border-border flex flex-col h-full gap-4">
      {/* Header row: title + week label */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">This Week&apos;s Story</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{getWeekLabel()}</span>
          <AppIcon name="calendar" className="w-3.5 h-3.5" />
          <button className="p-0.5 hover:bg-accent rounded" aria-label="Previous week">
            <AppIcon name="chevron-left" className="w-3.5 h-3.5" />
          </button>
          <button className="p-0.5 hover:bg-accent rounded" aria-label="Next week">
            <AppIcon name="chevron-right" className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Narrative one-liner */}
      <p className="text-sm text-muted-foreground -mt-2">{heroSentence}</p>

      {/* Day strip — embedded from weekly progress */}
      <DayStrip dailyPattern={dailyPattern} />

      {/* 3 KPI cells — using StatCard primitive */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Sessions Completed"
          value={`${sessionsCompleted}/${sessionsTotal}`}
          sublabel={
            sessionsTotal > 0
              ? `${Math.round((sessionsCompleted / sessionsTotal) * 100)}% completion rate`
              : 'None planned'
          }
        />
        <StatCard
          label="Avg Confidence Change"
          value="0%"
          valueColor="success"
          sublabel="Pre → Post session growth"
        />
        <StatCard
          label="Focus Mode Usage"
          value="0/0"
          sublabel="Used in 0% of sessions"
        />
      </div>

      {/* Next Best Action — conditional on setup state */}
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
