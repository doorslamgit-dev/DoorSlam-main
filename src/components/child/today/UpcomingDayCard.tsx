// src/components/child/today/UpcomingDayCard.tsx

import {
  formatDateShort,
  formatDuration,
  getSubjectIcon,
  getSubjectColorClass,
} from "../../../utils/dateUtils";
import type { UpcomingDay } from "../../../types/today";

type UpcomingDayCardProps = {
  day: UpcomingDay;
};

export default function UpcomingDayCard({ day }: UpcomingDayCardProps) {
  const sessions = day.sessions ?? [];

  const totalMinutes = sessions.reduce((sum, s) => {
    const minutes = typeof s.session_duration_minutes === "number" ? s.session_duration_minutes : 20;
    return sum + minutes;
  }, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{formatDateShort(day.date)}</h3>

        <span className="text-sm text-gray-500">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""} •{" "}
          {sessions.length > 0 ? formatDuration(totalMinutes) : "—"}
        </span>
      </div>

      {sessions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {sessions.map((session) => (
            <div
              key={session.planned_session_id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${getSubjectColorClass(
                session.subject_name
              )}`}
            >
              <span>{getSubjectIcon(session.subject_name)}</span>
              <span className="text-sm font-medium">{session.subject_name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500">No sessions planned.</div>
      )}
    </div>
  );
}
