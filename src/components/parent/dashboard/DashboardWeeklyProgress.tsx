// src/components/parent/dashboard/DashboardWeeklyProgress.tsx
// Full-width "This Week's Progress" card — streak narrative, progress bar, day-by-day strip

import AppIcon from '../../ui/AppIcon';
import ProgressBar from '../../ui/ProgressBar';
import type { ChildSummary, DailyPattern } from '../../../types/parent/parentDashboardTypes';

interface DashboardWeeklyProgressProps {
  child: ChildSummary | null;
  dailyPattern: DailyPattern[];
}

function buildStreakNarrative(
  child: ChildSummary,
  todayCompleted: number,
  todayTotal: number
): string {
  const name = child.preferred_name || child.first_name;
  const streak = child.current_streak;

  if (streak > 0 && todayTotal > todayCompleted) {
    const needed = todayTotal - todayCompleted;
    return `${name} is building an amazing habit. Complete ${needed > 1 ? `${needed} more sessions` : "today's session"} to reach a ${streak + 1}-day streak!`;
  }
  if (streak > 0 && todayCompleted >= todayTotal && todayTotal > 0) {
    return `${name} is on a ${streak}-day streak — fantastic dedication!`;
  }
  if (streak === 0 && todayTotal > 0) {
    return `${name} can start a streak today! ${todayTotal} session${todayTotal !== 1 ? 's' : ''} ready to go.`;
  }
  return `${name} is getting started with revision sessions.`;
}

export function DashboardWeeklyProgress({ child, dailyPattern }: DashboardWeeklyProgressProps) {
  if (!child || dailyPattern.length === 0) return null;

  const todayIdx = (new Date().getDay() + 6) % 7;
  const todayDay = dailyPattern[todayIdx];
  const todayCompleted = todayDay?.sessions_completed ?? 0;
  const todayTotal = todayDay?.sessions_total ?? 0;

  const totalSessions = dailyPattern.reduce((sum, d) => sum + d.sessions_total, 0);
  const completedSessions = dailyPattern.reduce((sum, d) => sum + d.sessions_completed, 0);
  const progressPct =
    totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  const narrative = buildStreakNarrative(child, todayCompleted, todayTotal);

  return (
    <div className="bg-background rounded-2xl shadow-sm p-5 border border-border">
      {/* Header */}
      <h2 className="text-base font-bold text-foreground mb-0.5">This Week&apos;s Progress</h2>
      <p className="text-sm text-muted mb-3">{narrative}</p>

      {/* Progress bar — using ProgressBar primitive */}
      <ProgressBar value={progressPct} color="primary" size="sm" animated className="mb-4" />

      {/* Day strip */}
      <div className="grid grid-cols-7 gap-2">
        {dailyPattern.map((day, idx) => {
          const isToday = idx === todayIdx;
          const isDone =
            day.sessions_completed >= day.sessions_total && day.sessions_total > 0;
          const inProgress = !isDone && day.sessions_completed > 0;
          const hasContent = day.sessions_total > 0;

          let cellClass = 'bg-muted border border-border text-muted';
          let cellContent: React.ReactNode = '-';
          let labelClass = 'text-muted';

          if (isDone) {
            cellClass = 'bg-success border-0 text-white';
            cellContent = <AppIcon name="check" className="w-4 h-4 mx-auto" />;
          } else if (inProgress) {
            cellClass = 'bg-primary/10 border border-primary/20 text-primary';
            cellContent = `${day.sessions_completed}/${day.sessions_total}`;
          } else if (isToday && hasContent) {
            cellClass = 'bg-primary border-0 text-primary-foreground';
            cellContent = `${day.sessions_completed}/${day.sessions_total}`;
            labelClass = 'text-dark font-semibold';
          } else if (isToday) {
            cellClass = 'bg-muted border-0 text-muted-foreground';
            labelClass = 'text-dark font-semibold';
          }

          return (
            <div key={day.day_of_week} className="flex flex-col items-center gap-1.5">
              <span className={`text-[11px] font-medium ${labelClass}`}>
                {isToday ? 'Today' : day.day_name_short}
              </span>
              <div
                className={`w-full h-12 rounded-xl flex items-center justify-center text-xs font-semibold ${cellClass}`}
              >
                {cellContent}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardWeeklyProgress;
