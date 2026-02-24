// src/components/parent/dashboard/DashboardWeeklyProgress.tsx
// Full-width "This Week's Progress" card — streak narrative, progress bar, day-by-day strip

import AppIcon from '../../ui/AppIcon';
import type { ChildSummary, DailyPattern } from '../../../types/parent/parentDashboardTypes';

interface DashboardWeeklyProgressProps {
  child: ChildSummary | null;
  dailyPattern: DailyPattern[];
}

function buildStreakNarrative(child: ChildSummary, todayCompleted: number, todayTotal: number): string {
  const name = child.preferred_name || child.first_name;
  const streak = child.current_streak;

  if (streak > 0 && todayTotal > todayCompleted) {
    const needed = todayTotal - todayCompleted;
    return `${name} is building an amazing habit. ${name} can complete ${needed > 1 ? `${needed} more sessions` : 'today\'s session'} to reach a ${streak + 1}-day streak!`;
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
  const progressPct = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  const narrative = buildStreakNarrative(child, todayCompleted, todayTotal);

  return (
    <div className="bg-neutral-0 rounded-2xl shadow-card p-5 border border-neutral-200/50">
      {/* Header */}
      <h2 className="text-base font-bold text-neutral-800 mb-0.5">This Week&apos;s Progress</h2>
      <p className="text-sm text-neutral-500 mb-3">{narrative}</p>

      {/* Progress bar */}
      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-primary-500 transition-all duration-500"
          style={{ width: `${Math.max(progressPct, 0)}%` }}
        />
      </div>

      {/* Day strip */}
      <div className="grid grid-cols-7 gap-2">
        {dailyPattern.map((day, idx) => {
          const isToday = idx === todayIdx;
          const isDone = day.sessions_completed >= day.sessions_total && day.sessions_total > 0;
          const inProgress = !isDone && day.sessions_completed > 0;
          const hasContent = day.sessions_total > 0;

          let cellClass = 'bg-neutral-50 border border-neutral-200/60 text-neutral-400';
          let cellContent: React.ReactNode = '-';
          let labelClass = 'text-neutral-400';

          if (isDone) {
            cellClass = 'bg-accent-green border-0 text-white';
            cellContent = <AppIcon name="check" className="w-4 h-4 mx-auto" />;
          } else if (inProgress) {
            cellClass = 'bg-primary-100 border border-primary-200 text-primary-700';
            cellContent = `${day.sessions_completed}/${day.sessions_total}`;
          } else if (isToday && hasContent) {
            cellClass = 'bg-primary-600 border-0 text-white';
            cellContent = `${day.sessions_completed}/${day.sessions_total}`;
            labelClass = 'text-neutral-800 font-semibold';
          } else if (isToday) {
            cellClass = 'bg-neutral-200 border-0 text-neutral-500';
            labelClass = 'text-neutral-700 font-semibold';
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
