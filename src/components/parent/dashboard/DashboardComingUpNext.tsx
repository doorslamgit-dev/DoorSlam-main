// src/components/parent/dashboard/DashboardComingUpNext.tsx
// "Coming Up Next" card — upcoming sessions grouped by day

import EmptyState from '../../ui/EmptyState';
import { getSubjectColor } from '../../../constants/colors';
import type { ComingUpSession } from '../../../types/parent/parentDashboardTypes';

interface DashboardComingUpNextProps {
  sessions: ComingUpSession[];
}

interface DayGroup {
  label: string;
  sessions: ComingUpSession[];
}

function groupByDay(sessions: ComingUpSession[]): DayGroup[] {
  const upcoming = sessions.filter((s) => !s.is_today);
  const map = new Map<string, DayGroup>();

  upcoming.forEach((session) => {
    const key = session.day_label;
    if (!map.has(key)) {
      map.set(key, { label: key, sessions: [] });
    }
    map.get(key)!.sessions.push(session);
  });

  return Array.from(map.values()).slice(0, 3);
}

function DayAvatar({ label }: { label: string }) {
  const isTomorrow = label === 'Tomorrow';
  const abbr = isTomorrow ? 'Tmr' : label.slice(0, 3);
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
        isTomorrow ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
      }`}
    >
      {abbr}
    </div>
  );
}

export function DashboardComingUpNext({ sessions }: DashboardComingUpNextProps) {
  const groups = groupByDay(sessions);

  return (
    <div className="bg-background rounded-2xl shadow-sm p-4 border border-border">
      <h3 className="text-sm font-bold text-foreground mb-3">Coming Up Next</h3>

      {groups.length === 0 ? (
        <EmptyState
          variant="minimal"
          icon="calendar-days"
          title="No upcoming sessions"
          iconColor="text-muted-foreground"
        />
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.label} className="flex items-start gap-3">
              <DayAvatar label={group.label} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground mb-1">{group.label}</p>
                <ul className="space-y-1">
                  {group.sessions.slice(0, 3).map((session) => {
                    const color = getSubjectColor(session.subject_name);
                    return (
                      <li key={session.planned_session_id} className="flex items-center gap-1.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-muted-foreground truncate">
                          {session.subject_name}
                          {session.topic_name && session.topic_name !== 'Topic TBD'
                            ? ` — ${session.topic_name}`
                            : ' — Topic TBD'}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DashboardComingUpNext;
