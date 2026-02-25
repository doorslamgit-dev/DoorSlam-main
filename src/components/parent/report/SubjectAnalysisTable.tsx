// src/components/parent/insights/SubjectAnalysisTable.tsx
// Subject analysis table for Parent Insights report
// FEAT-010: AppIcon + theme-ready classes (no FontAwesome, no hard-coded colours)

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";
import type { SubjectMetric } from "../../../types/parent/insightsReportTypes";

interface SubjectAnalysisTableProps {
  subjects: SubjectMetric[];
}

function trendIcon(trend: SubjectMetric["trend"]): IconKey {
  switch (trend) {
    case "improving":
      return "trending-up";
    case "declining":
      return "trending-down";
    default:
      // Neutral / no change
      return "circle";
  }
}

function trendColor(trend: SubjectMetric["trend"]) {
  switch (trend) {
    case "improving":
      return "text-success";
    case "declining":
      return "text-warning";
    default:
      return "text-muted-foreground";
  }
}

export function SubjectAnalysisTable({ subjects }: SubjectAnalysisTableProps) {
  return (
    <section className="mb-10 report-card page-break-before">
      <h2 className="text-xl font-bold text-primary mb-4">
        Subject Analysis
      </h2>

      {subjects.length > 0 ? (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-primary">
                Subject
              </th>
              <th className="text-center py-3 px-4 font-semibold text-primary">
                Sessions
              </th>
              <th className="text-center py-3 px-4 font-semibold text-primary">
                Avg Pre
              </th>
              <th className="text-center py-3 px-4 font-semibold text-primary">
                Avg Post
              </th>
              <th className="text-center py-3 px-4 font-semibold text-primary">
                Trend
              </th>
            </tr>
          </thead>

          <tbody>
            {subjects.map((subject, idx) => (
              <tr
                key={subject.subject_id}
                className={idx % 2 === 0 ? "bg-background" : "bg-muted"}
              >
                <td className="py-3 px-4 font-medium text-primary">
                  {subject.subject_name}
                </td>
                <td className="py-3 px-4 text-center text-muted-foreground">
                  {subject.session_count}
                </td>
                <td className="py-3 px-4 text-center text-muted-foreground">
                  {subject.avg_pre_confidence ?? "–"}%
                </td>
                <td className="py-3 px-4 text-center text-muted-foreground">
                  {subject.avg_post_confidence ?? "–"}%
                </td>
                <td className="py-3 px-4 text-center">
                  <AppIcon
                    name={trendIcon(subject.trend)}
                    className={`w-4 h-4 ${trendColor(subject.trend)}`}
                    aria-hidden
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-muted-foreground italic">
          No subject data available yet.
        </p>
      )}
    </section>
  );
}

export default SubjectAnalysisTable;
