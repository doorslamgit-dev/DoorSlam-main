// src/components/parent/dashboard/DashboardTodaySessions.tsx
// Today's Sessions card — lists today's planned sessions with subject + status

import AppIcon from '../../ui/AppIcon';
import Badge from '../../ui/Badge';
import EmptyState from '../../ui/EmptyState';
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
): { label: string; variant: 'warning' | 'default' } {
  const needsAttention = reminders.some(
    (r) =>
      r.subject_id === session.subject_id &&
      (r.type === 'subject_neglected' || r.type === 'topic_to_revisit')
  );
  if (needsAttention) {
    return { label: 'Needs Attention', variant: 'warning' };
  }
  return { label: 'Scheduled', variant: 'default' };
}

export function DashboardTodaySessions({ sessions, reminders }: DashboardTodaySessionsProps) {
  const todaySessions = sessions.filter((s) => s.is_today);

  return (
    <div className="bg-background rounded-2xl shadow-sm p-5 border border-default h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-bold text-dark">Today&apos;s Sessions</h2>
        {todaySessions.length > 0 && (
          <Badge variant="primary" size="sm">
            {todaySessions.length} session{todaySessions.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Session list or empty state */}
      {todaySessions.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            variant="minimal"
            icon="calendar-check"
            title="No sessions today"
            iconColor="text-muted-foreground"
          />
        </div>
      ) : (
        <div className="space-y-3 flex-1">
          {todaySessions.map((session) => {
            const color = getSubjectColor(session.subject_name);
            const badge = getSessionBadge(session, reminders);
            return (
              <div key={session.planned_session_id} className="flex items-center gap-3">
                {/* Subject icon — dynamic color so using inline style */}
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

                {/* Session info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark truncate">
                    {session.subject_name}
                  </p>
                  <p className="text-xs text-muted truncate">{session.topic_name}</p>
                </div>

                {/* Status badge — using Badge primitive */}
                <Badge variant={badge.variant} size="sm">
                  {badge.label}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DashboardTodaySessions;
