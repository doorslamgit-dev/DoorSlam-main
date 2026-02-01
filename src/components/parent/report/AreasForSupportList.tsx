// src/components/parent/insights/AreasForSupportList.tsx
// Areas for Support list for Parent Insights report
// FEAT-010: Theme-ready classes (no FontAwesome, no hard-coded hex, no gray/amber literals)

import AppIcon from "../../ui/AppIcon";
import type { TopicSupport } from "../../../types/parent/insightsReportTypes";
import { formatReportDate } from "../../../utils/reportUtils";

interface AreasForSupportListProps {
  areasForSupport: TopicSupport[];
}

export function AreasForSupportList({
  areasForSupport,
}: AreasForSupportListProps) {
  return (
    <section className="mb-10 report-card">
      <h2 className="text-xl font-bold text-primary-900 mb-4 flex items-center gap-2">
        <AppIcon
          name="triangle-alert"
          className="w-5 h-5 text-accent-amber"
          aria-hidden
        />
        <span>Areas for Support</span>
      </h2>

      {areasForSupport.length > 0 ? (
        <div className="space-y-3">
          {areasForSupport.map((topic) => (
            <div
              key={topic.topic_id}
              className="flex items-center justify-between bg-accent-amber/10 border border-accent-amber/20 rounded-lg px-4 py-3"
            >
              <div>
                <p className="font-medium text-primary-900">
                  {topic.topic_name}
                </p>
                <p className="text-sm text-neutral-500">
                  {topic.subject_name} • Last reviewed:{" "}
                  {formatReportDate(topic.last_reviewed)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-accent-amber">
                  {topic.confidence_percent}%
                </p>
                <p className="text-xs text-neutral-500">confidence</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 italic">
          No areas of concern identified.
        </p>
      )}
    </section>
  );
}

export default AreasForSupportList;
