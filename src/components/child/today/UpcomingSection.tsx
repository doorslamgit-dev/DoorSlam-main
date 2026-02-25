// src/components/child/today/UpcomingSection.tsx
// Coming Up Next - Timeline style

import type { UpcomingDay } from "../../../types/today";

interface UpcomingSectionProps {
  days: UpcomingDay[];
}

/**
 * Format date string to friendly label
 */
function formatDayLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  if (targetDate.getTime() === tomorrow.getTime()) {
    return "Tomorrow";
  }

  const diffDays = Math.ceil(
    (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 2) return "In 2 days";
  if (diffDays === 3) return "In 3 days";

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

/**
 * Get short day name from date
 */
function getShortDayName(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

export default function UpcomingSection({ days }: UpcomingSectionProps) {
  if (days.length === 0) return null;

  return (
    <div className="bg-background rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-primary mb-4">Coming Up Next</h2>

      <div className="space-y-4">
        {days.map((day, dayIndex) => {
          const isLast = dayIndex === days.length - 1;
          const dayLabel = formatDayLabel(day.date);
          const shortDay = getShortDayName(day.date);
          const isFirstDay = dayIndex === 0;

          return (
            <div key={day.date} className="flex items-start space-x-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isFirstDay ? "bg-primary/10" : "bg-secondary"
                  }`}
                >
                  <span
                    className={`font-bold text-sm ${
                      isFirstDay ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {shortDay}
                  </span>
                </div>
                {!isLast && <div className="w-0.5 h-16 bg-border my-2" />}
              </div>
              <div className="flex-1 pt-2">
                <p className="text-muted-foreground text-sm mb-2">{dayLabel}</p>
                <div className="space-y-2">
                  {day.sessions.slice(0, 2).map((session) => (
                    <div
                      key={session.planned_session_id}
                      className="flex items-center space-x-2"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isFirstDay ? "bg-primary" : "bg-muted-foreground"
                        }`}
                      />
                      <span className="text-foreground font-medium">
                        {session.subject_name} -{" "}
                        {session.topic_names?.[0] || "Topic TBD"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}