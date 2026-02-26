// src/components/parent/insights/ExecutiveSummary.tsx
// Executive summary for Parent Insights report
// FEAT-010: AppIcon (lucide-react) + theme-ready classes (no FontAwesome, no hex)

import AppIcon from "../../ui/AppIcon";
import type {
  LifetimeMetrics,
  StreakData,
} from "../../../types/parent/insightsReportTypes";
import { formatReportDate } from "../../../utils/reportUtils";

interface ExecutiveSummaryProps {
  lifetime: LifetimeMetrics;
  streak: StreakData;
}

export function ExecutiveSummary({
  lifetime,
  streak,
}: ExecutiveSummaryProps) {
  return (
    <section className="mb-10 report-card">
      <h2 className="text-xl font-bold text-foreground mb-4">
        Executive Summary
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Sessions */}
        <div className="bg-primary/5 rounded-lg p-4 text-center border border-primary/20">
          <p className="text-3xl font-bold text-primary">
            {lifetime.total_sessions}
          </p>
          <p className="text-sm text-muted-foreground">Total Sessions</p>
        </div>

        {/* Completion Rate */}
        <div className="bg-success/10 rounded-lg p-4 text-center border border-success/20">
          <p className="text-3xl font-bold text-success">
            {lifetime.completion_rate || 0}%
          </p>
          <p className="text-sm text-muted-foreground">Completion Rate</p>
        </div>

        {/* Sessions Improved */}
        <div className="bg-warning/10 rounded-lg p-4 text-center border border-warning/20">
          <p className="text-3xl font-bold text-warning">
            {lifetime.sessions_with_improvement}
          </p>
          <p className="text-sm text-muted-foreground">Sessions Improved</p>
        </div>

        {/* Current Streak */}
        <div className="bg-muted rounded-lg p-4 text-center border border-border">
          <p className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <AppIcon
              name="flame"
              className="w-6 h-6 text-warning"
              aria-hidden
            />
            <span>{streak.current}</span>
          </p>
          <p className="text-sm text-muted-foreground">Current Streak</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        First session: {formatReportDate(lifetime.first_session_date)} • Longest
        streak: {streak.longest} days
      </p>
    </section>
  );
}

export default ExecutiveSummary;
