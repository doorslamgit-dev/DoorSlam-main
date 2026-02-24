// src/components/parent/dashboard/DashboardTodaySessions.tsx
// Today's Sessions card — lists today's planned sessions with subject + status

import AppIcon from '../../ui/AppIcon';
import { getSubjectIcon } from '../../../constants/icons';
import { getSubjectColor } from '../../../constants/colors';
import type { ComingUpSession, GentleReminder } from '../../../types/parent/parentDashboardTypes';

interface DashboardTodaySessionsProps {
  sessions: ComingUpSession[];
  reminders: GentleReminder[];
}

function getSessionBadge(
  session: ComingUpSession,
  reminders: GentleReminder[]
): { label: string; className: string } {
  const needsAttention = reminders.some(
    (r) =>
      r.subject_id === session.subject_id &&
      (r.type === 'subject_neglected' || r.type === 'topic_to_revisit')
  );
  if (needsAttention) {
    return {
      label: 'Needs Attention',
      className: 'bg-accent-red/10 text-accent-red',
    };
  }
  return {
    label: 'Scheduled',
    className: 'bg-neutral-100 text-neutral-600',
  };
}

export function DashboardTodaySessions({ sessions, reminders }: DashboardTodaySessionsProps) {
  const todaySessions = sessions.filter((s) => s.is_today);

  return (
    <div className="bg-neutral-0 rounded-2xl shadow-card p-5 border border-neutral-200/50 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-bold text-neutral-800">Today&apos;s Sessions</h2>
        {todaySessions.length > 0 && (
          <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
            {todaySessions.length} session{todaySessions.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Session list */}
      {todaySessions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <AppIcon name="calendar-check" className="w-5 h-5 text-neutral-400" />
          </div>
          <p className="text-xs text-neutral-500">No sessions scheduled for today</p>
        </div>
      ) : (
        <div className="space-y-3 flex-1">
          {todaySessions.map((session) => {
            const color = getSubjectColor(session.subject_name);
            const badge = getSessionBadge(session, reminders);
            return (
              <div key={session.planned_session_id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <AppIcon
                    name={getSubjectIcon(session.subject_icon)}
                    className="w-4 h-4"
                    style={{ color }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-800 truncate">
                    {session.subject_name}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">{session.topic_name}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg shrink-0 ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DashboardTodaySessions;
