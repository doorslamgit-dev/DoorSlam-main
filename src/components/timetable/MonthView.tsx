import type { TimetableSession } from "../../services/timetableService";
import { getSubjectColor } from "../../constants/colors";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface MonthViewProps {
  referenceDate: Date;
  sessions: TimetableSession[];
  blockedDates?: string[];
}

export function MonthView({
  referenceDate,
  sessions,
  blockedDates = [],
}: MonthViewProps) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const getSessionsForDay = (day: number): TimetableSession[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return sessions.filter((s) => s.session_date === dateStr);
  };

  const isBlocked = (day: number): boolean => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return blockedDates.includes(dateStr);
  };

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  return (
    <div className="bg-neutral-0 rounded-2xl shadow-card overflow-hidden mb-6">
      <div className="p-6">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium py-2 text-neutral-600"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-24" />;
            }

            const daySessions = getSessionsForDay(day);
            const isToday = isCurrentMonth && today.getDate() === day;
            const dayBlocked = isBlocked(day);

            return (
              <div
                key={day}
                className={`h-24 border rounded-lg p-2 overflow-hidden ${
                  dayBlocked
                    ? "border-neutral-300 bg-neutral-100"
                    : isToday
                    ? "border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/30"
                    : "border-neutral-200 bg-neutral-0"
                }`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    dayBlocked
                      ? "text-neutral-400"
                      : isToday
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-neutral-700"
                  }`}
                >
                  {day}
                </div>
                {dayBlocked ? (
                  <div className="text-xs text-neutral-400 italic">Blocked</div>
                ) : (
                  <div className="space-y-1">
                    {daySessions.slice(0, 2).map((session) => {
                      const color = getSubjectColor(session.subject_name);
                      return (
                        <div
                          key={session.planned_session_id}
                          className="text-xs px-1.5 py-0.5 rounded truncate"
                          style={{
                            backgroundColor: `${color}20`,
                            color: color,
                          }}
                        >
                          {session.subject_name}
                        </div>
                      );
                    })}
                    {daySessions.length > 2 && (
                      <div className="text-xs text-neutral-500">
                        +{daySessions.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
