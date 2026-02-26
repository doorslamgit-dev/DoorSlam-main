// src/components/child/today/TodayProgressCard.tsx
// This Week's Progress with week grid

import AppIcon from "../../ui/AppIcon";

interface TodayProgressCardProps {
  completedToday: number;
  totalToday: number;
  currentStreak: number;
}

export default function TodayProgressCard({
  completedToday,
  totalToday,
  currentStreak,
}: TodayProgressCardProps) {
  return (
    <div className="bg-background rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-primary mb-4">This Week's Progress</h2>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted-foreground font-medium">Sessions completed</span>
          <span className="text-primary font-bold text-lg">
            {completedToday} / {totalToday}
          </span>
        </div>
        <div className="w-full bg-border rounded-full h-3 overflow-hidden">
          <div
            className="bg-success h-full rounded-full transition-all duration-500"
            style={{
              width: totalToday > 0 ? `${(completedToday / totalToday) * 100}%` : "0%",
            }}
          />
        </div>
      </div>

      {/* Week grid */}
      <WeekProgressGrid
        completedToday={completedToday}
        totalToday={totalToday}
        streak={currentStreak}
      />
    </div>
  );
}

/**
 * Week Progress Grid - shows 7 days with completion status
 */
function WeekProgressGrid({
  completedToday,
  totalToday,
  streak,
}: {
  completedToday: number;
  totalToday: number;
  streak: number;
}) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Get start of week (Monday)
  const startOfWeek = new Date(today);
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(today.getDate() + diff);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Calculate which days are completed based on streak
  const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Mon=0 index

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day, index) => {
        const isPast = index < todayIndex;
        const isCurrentDay = index === todayIndex;

        // Determine completion status based on streak
        const isCompletedDay = isPast && index >= todayIndex - streak && streak > 0;

        return (
          <div key={day} className="flex flex-col items-center">
            <span
              className={`text-xs mb-2 ${
                isCurrentDay ? "text-primary dark:text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              {isCurrentDay ? "Today" : day}
            </span>

            <div
              className={`w-full h-16 rounded-lg flex items-center justify-center ${
                isCompletedDay
                  ? "bg-success"
                  : isCurrentDay
                  ? "bg-primary/10 dark:bg-primary/20 border-2 border-primary dark:border-primary"
                  : "bg-secondary"
              }`}
            >
              {isCompletedDay ? (
                <AppIcon name="check" className="text-primary-foreground w-5 h-5" />
              ) : isCurrentDay ? (
                <span className="text-primary dark:text-primary font-bold">
                  {completedToday}/{totalToday}
                </span>
              ) : (
                <span className="text-muted-foreground font-bold">-</span>
              )}
            </div>

            <span
              className={`text-xs mt-1 font-medium ${
                isCompletedDay ? "text-muted-foreground" : "text-muted-foreground"
              }`}
            >
              {isCompletedDay ? "✓" : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}