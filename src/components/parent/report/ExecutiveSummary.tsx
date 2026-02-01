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
      <h2 className="text-xl font-bold text-primary-900 mb-4">
        Executive Summary
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Sessions */}
        <div className="bg-primary-50 rounded-lg p-4 text-center border border-primary-200/40">
          <p className="text-3xl font-bold text-primary-600">
            {lifetime.total_sessions}
          </p>
          <p className="text-sm text-neutral-600">Total Sessions</p>
        </div>

        {/* Completion Rate */}
        <div className="bg-accent-green/10 rounded-lg p-4 text-center border border-accent-green/20">
          <p className="text-3xl font-bold text-accent-green">
            {lifetime.completion_rate || 0}%
          </p>
          <p className="text-sm text-neutral-600">Completion Rate</p>
        </div>

        {/* Sessions Improved */}
        <div className="bg-accent-amber/10 rounded-lg p-4 text-center border border-accent-amber/20">
          <p className="text-3xl font-bold text-accent-amber">
            {lifetime.sessions_with_improvement}
          </p>
          <p className="text-sm text-neutral-600">Sessions Improved</p>
        </div>

        {/* Current Streak */}
        <div className="bg-neutral-50 rounded-lg p-4 text-center border border-neutral-200/50">
          <p className="text-3xl font-bold text-primary-900 flex items-center justify-center gap-2">
            <AppIcon
              name="flame"
              className="w-6 h-6 text-accent-amber"
              aria-hidden
            />
            <span>{streak.current}</span>
          </p>
          <p className="text-sm text-neutral-600">Current Streak</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-neutral-500">
        First session: {formatReportDate(lifetime.first_session_date)} • Longest
        streak: {streak.longest} days
      </p>
    </section>
  );
}

export default ExecutiveSummary;
