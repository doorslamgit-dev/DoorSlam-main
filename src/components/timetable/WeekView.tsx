import {
  getWeekStart,
  formatDateISO,
  getTopicNames,
  type WeekDayData,
} from "../../services/timetableService";
import { getSubjectColor } from "../../constants/colors";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface WeekViewProps {
  weekData: WeekDayData[];
  referenceDate: Date;
  isDateBlocked: (dateStr: string) => boolean;
}

export function WeekView({
  weekData,
  referenceDate,
  isDateBlocked,
}: WeekViewProps) {
  const weekStart = getWeekStart(referenceDate);

  return (
    <div className="bg-neutral-0 rounded-2xl shadow-card overflow-hidden mb-6">
      {/* Header Row */}
      <div className="grid grid-cols-8 border-b border-neutral-200">
        <div className="p-4 border-r bg-neutral-50 border-neutral-200">
          <div className="text-sm font-medium text-neutral-700">Time</div>
        </div>
        {DAYS.map((day, index) => {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + index);
          const dateStr = formatDateISO(date);
          const isToday = new Date().toDateString() === date.toDateString();
          const isBlocked = isDateBlocked(dateStr);

          return (
            <div
              key={day}
              className={`p-4 text-center border-r last:border-r-0 border-neutral-200 ${
                isBlocked
                  ? "bg-neutral-200"
                  : isToday
                  ? "bg-primary-50 dark:bg-primary-900/30"
                  : "bg-neutral-0"
              }`}
            >
              <div
                className={`text-sm font-medium ${
                  isBlocked
                    ? "text-neutral-500"
                    : isToday
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-neutral-700"
                }`}
              >
                {day}
              </div>
              <div
                className={`text-xs ${
                  isBlocked
                    ? "text-neutral-400"
                    : isToday
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-neutral-500"
                }`}
              >
                {date.getDate()}
              </div>
              {isBlocked && (
                <div className="text-xs text-neutral-400 mt-1">Blocked</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Session Row */}
      <div className="grid grid-cols-8 min-h-[200px]">
        <div className="p-4 border-r flex items-start bg-neutral-50 border-neutral-200">
          <div>
            <div className="text-sm font-medium text-neutral-700">Sessions</div>
            <div className="text-xs text-neutral-500">All day</div>
          </div>
        </div>
        {DAYS.map((_, dayIndex) => {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + dayIndex);
          const dateStr = formatDateISO(date);
          const isBlocked = isDateBlocked(dateStr);

          const dayData = weekData.find((d) => d.day_date === dateStr);
          const daySessions = dayData?.sessions || [];

          return (
            <div
              key={dayIndex}
              className={`p-3 border-r last:border-r-0 border-neutral-200 ${
                isBlocked ? "bg-neutral-100" : ""
              }`}
            >
              {isBlocked ? (
                <div className="h-full flex items-center justify-center">
                  <span className="text-xs text-neutral-400 italic">
                    No revision
                  </span>
                </div>
              ) : daySessions.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <span className="text-xs text-neutral-400">No sessions</span>
                </div>
              ) : (
                daySessions.map((session) => {
                  const color = getSubjectColor(session.subject_name);
                  return (
                    <div
                      key={session.planned_session_id}
                      className="rounded-lg p-3 mb-2 last:mb-0 cursor-pointer hover:opacity-90 transition-opacity"
                      style={{
                        backgroundColor: `${color}15`,
                        borderLeft: `4px solid ${color}`,
                      }}
                    >
                      <div
                        className="text-sm font-semibold mb-1"
                        style={{ color: color }}
                      >
                        {session.subject_name}
                      </div>
                      <div className="text-xs text-neutral-600">
                        {getTopicNames(session)}
                      </div>
                      <div className="text-xs mt-2 text-neutral-500">
                        {session.session_duration_minutes} mins
                      </div>
                      {session.status === "completed" && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full text-white bg-accent-green">
                          Done
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
