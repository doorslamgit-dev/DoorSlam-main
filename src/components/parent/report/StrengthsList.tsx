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
      <h2 className="text-xl font-bold text-primary-900 mb-4 flex items-center gap-2">
        <AppIcon
          name="check-circle"
          className="w-5 h-5 text-accent-green"
          aria-hidden
        />
        <span>Strengths</span>
      </h2>

      {strengths.length > 0 ? (
        <div className="space-y-3">
          {strengths.map((topic) => (
            <div
              key={topic.topic_id}
              className="flex items-center justify-between bg-accent-green/10 border border-accent-green/20 rounded-lg px-4 py-3"
            >
              <div>
                <p className="font-medium text-primary-900">
                  {topic.topic_name}
                </p>
                <p className="text-sm text-neutral-500">
                  {topic.subject_name} • {topic.sessions_completed} sessions
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-accent-green">
                  {topic.confidence_percent}%
                </p>
                <p className="text-xs text-neutral-500">confidence</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 italic">
          Building confidence — check back after more sessions.
        </p>
      )}
    </section>
  );
}

export default StrengthsList;
