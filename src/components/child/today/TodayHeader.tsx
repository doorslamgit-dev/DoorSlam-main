// src/components/child/today/TodayHeader.tsx
// Greeting section with streak badge

import AppIcon from "../../ui/AppIcon";

interface TodayHeaderProps {
  childName: string;
  currentStreak: number;
}

export default function TodayHeader({ childName, currentStreak }: TodayHeaderProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-foreground">Hi {childName} 👋</h1>
        {currentStreak > 0 && (
          <div className="flex items-center space-x-2 bg-success/10 px-4 py-2 rounded-full">
            <AppIcon name="flame" className="text-success w-4 h-4" />
            <span className="text-success font-semibold text-sm">
              {currentStreak}-day streak
            </span>
          </div>
        )}
      </div>
      <p className="text-muted-foreground text-lg">
        {currentStreak > 0
          ? "Ready to keep the momentum going?"
          : "Ready to tackle your revision today?"}
      </p>
    </section>
  );
}