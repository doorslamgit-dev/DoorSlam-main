// src/components/parent/insights/ProgressTimeline.tsx
// Progress timeline for Parent Insights report
// FEAT-010: Theme-ready classes (no hard-coded colours, no FontAwesome)

import type {
  LifetimeMetrics,
  PeriodMetrics,
} from "../../../types/parent/insightsReportTypes";

interface ProgressTimelineProps {
  thisWeek: PeriodMetrics;
  thisMonth: PeriodMetrics;
  lifetime: LifetimeMetrics;
}

interface PeriodCardProps {
  title: string;
  totalSessions: number;
  totalPlanned: number;
  completionRate: number;
  avgConfidenceChange: number;
}

function PeriodCard({
  title,
  totalSessions,
  totalPlanned,
  completionRate,
  avgConfidenceChange,
}: PeriodCardProps) {
  const positiveChange = (avgConfidenceChange || 0) > 0;

  return (
    <div className="border border-border rounded-lg p-4 bg-background">
      <h3 className="font-semibold text-primary mb-3 text-sm uppercase tracking-wide">
        {title}
      </h3>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Sessions</span>
          <span className="font-medium text-primary">
            {totalSessions}/{totalPlanned}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Completion</span>
          <span className="font-medium text-primary">
            {completionRate || 0}%
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Avg Change</span>
          <span
            className={`font-medium ${
              positiveChange ? "text-success" : "text-muted-foreground"
            }`}
          >
            {positiveChange ? "+" : ""}
            {avgConfidenceChange || 0}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ProgressTimeline({
  thisWeek,
  thisMonth,
  lifetime,
}: ProgressTimelineProps) {
  return (
    <section className="mb-10 report-card">
      <h2 className="text-xl font-bold text-primary mb-4">
        Progress Timeline
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PeriodCard
          title="This Week"
          totalSessions={thisWeek.total_sessions}
          totalPlanned={thisWeek.total_planned}
          completionRate={thisWeek.completion_rate}
          avgConfidenceChange={thisWeek.avg_confidence_change}
        />
        <PeriodCard
          title="This Month"
          totalSessions={thisMonth.total_sessions}
          totalPlanned={thisMonth.total_planned}
          completionRate={thisMonth.completion_rate}
          avgConfidenceChange={thisMonth.avg_confidence_change}
        />
        <PeriodCard
          title="All Time"
          totalSessions={lifetime.total_sessions}
          totalPlanned={lifetime.total_planned}
          completionRate={lifetime.completion_rate}
          avgConfidenceChange={lifetime.avg_confidence_change}
        />
      </div>
    </section>
  );
}

export default ProgressTimeline;
