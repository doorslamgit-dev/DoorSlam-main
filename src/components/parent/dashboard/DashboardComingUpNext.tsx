// src/components/parent/dashboard/DashboardComingUpNext.tsx
// "Coming Up Next" card — upcoming sessions grouped by day

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
        isTomorrow ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-600'
      }`}
    >
      {abbr}
    </div>
  );
}

export function DashboardComingUpNext({ sessions }: DashboardComingUpNextProps) {
  const groups = groupByDay(sessions);

  return (
    <div className="bg-neutral-0 rounded-2xl shadow-card p-4 border border-neutral-200/50">
      <h3 className="text-sm font-bold text-neutral-800 mb-3">Coming Up Next</h3>

      {groups.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-xs text-neutral-400">No upcoming sessions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.label} className="flex items-start gap-3">
              <DayAvatar label={group.label} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-neutral-600 mb-1">{group.label}</p>
                <ul className="space-y-1">
                  {group.sessions.slice(0, 3).map((session) => {
                    const color = getSubjectColor(session.subject_name);
                    return (
                      <li
                        key={session.planned_session_id}
                        className="flex items-center gap-1.5"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-neutral-600 truncate">
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
