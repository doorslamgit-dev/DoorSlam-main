// src/components/parent/insights/StrengthsList.tsx
// Strengths list for Parent Insights report
// FEAT-010: AppIcon + theme-ready classes (no FontAwesome, no hard-coded colours)

import AppIcon from "../../ui/AppIcon";
import type { TopicStrength } from "../../../types/parent/insightsReportTypes";

interface StrengthsListProps {
  strengths: TopicStrength[];
}

export function StrengthsList({ strengths }: StrengthsListProps) {
  return (
    <section className="mb-10 report-card">
      <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
        <AppIcon
          name="check-circle"
          className="w-5 h-5 text-success"
          aria-hidden
        />
        <span>Strengths</span>
      </h2>

      {strengths.length > 0 ? (
        <div className="space-y-3">
          {strengths.map((topic) => (
            <div
              key={topic.topic_id}
              className="flex items-center justify-between bg-success/10 border border-success/20 rounded-lg px-4 py-3"
            >
              <div>
                <p className="font-medium text-primary">
                  {topic.topic_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {topic.subject_name} • {topic.sessions_completed} sessions
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-success">
                  {topic.confidence_percent}%
                </p>
                <p className="text-xs text-muted-foreground">confidence</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground italic">
          Building confidence — check back after more sessions.
        </p>
      )}
    </section>
  );
}

export default StrengthsList;
