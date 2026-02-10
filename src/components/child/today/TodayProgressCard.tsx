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
    <div className="bg-neutral-0 dark:bg-neutral-800 rounded-2xl shadow-card p-6">
      <h2 className="text-xl font-bold text-primary-900 dark:text-neutral-100 mb-4">This Week's Progress</h2>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-neutral-600 dark:text-neutral-300 font-medium">Sessions completed</span>
          <span className="text-primary-900 dark:text-neutral-100 font-bold text-lg">
            {completedToday} / {totalToday}
          </span>
        </div>
        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-accent-green h-full rounded-full transition-all duration-500"
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
                isCurrentDay ? "text-primary-700 dark:text-primary-400 font-semibold" : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              {isCurrentDay ? "Today" : day}
            </span>

            <div
              className={`w-full h-16 rounded-lg flex items-center justify-center ${
                isCompletedDay
                  ? "bg-accent-green"
                  : isCurrentDay
                  ? "bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-600 dark:border-primary-500"
                  : "bg-neutral-100 dark:bg-neutral-700"
              }`}
            >
              {isCompletedDay ? (
                <AppIcon name="check" className="text-white w-5 h-5" />
              ) : isCurrentDay ? (
                <span className="text-primary-700 dark:text-primary-400 font-bold">
                  {completedToday}/{totalToday}
                </span>
              ) : (
                <span className="text-neutral-400 dark:text-neutral-500 font-bold">-</span>
              )}
            </div>

            <span
              className={`text-xs mt-1 font-medium ${
                isCompletedDay ? "text-neutral-600 dark:text-neutral-300" : "text-neutral-400 dark:text-neutral-500"
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