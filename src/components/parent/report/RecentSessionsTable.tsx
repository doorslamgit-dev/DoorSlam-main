// src/components/parent/insights/RecentSessionsTable.tsx
// Recent session history table for Parent Insights report
// FEAT-010: Theme-ready classes (no FontAwesome, no hard-coded hex)

import type { RecentSession } from "../../../types/parent/insightsReportTypes";
import {
  formatReportDate,
  getConfidenceLabel,
} from "../../../utils/reportUtils";

interface RecentSessionsTableProps {
  recentSessions: RecentSession[];
}

export function RecentSessionsTable({
  recentSessions,
}: RecentSessionsTableProps) {
  return (
    <section className="mb-10 report-card page-break-before">
      <h2 className="text-xl font-bold text-primary mb-4">
        Recent Session History
      </h2>

      {recentSessions.length > 0 ? (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted border-b border-border">
              <th className="text-left py-2 px-3 font-semibold text-primary">
                Date
              </th>
              <th className="text-left py-2 px-3 font-semibold text-primary">
                Topic
              </th>
              <th className="text-left py-2 px-3 font-semibold text-primary">
                Subject
              </th>
              <th className="text-center py-2 px-3 font-semibold text-primary">
                Before
              </th>
              <th className="text-center py-2 px-3 font-semibold text-primary">
                After
              </th>
            </tr>
          </thead>

          <tbody>
            {recentSessions.map((session, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? "bg-background" : "bg-muted"}
              >
                <td className="py-2 px-3 text-muted-foreground">
                  {formatReportDate(session.date)}
                </td>
                <td className="py-2 px-3 font-medium text-primary">
                  {session.topic_name}
                </td>
                <td className="py-2 px-3 text-muted-foreground">
                  {session.subject_name}
                </td>
                <td className="py-2 px-3 text-center text-muted-foreground">
                  {getConfidenceLabel(session.pre_confidence)}
                </td>
                <td className="py-2 px-3 text-center text-muted-foreground">
                  {getConfidenceLabel(session.post_confidence)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-muted-foreground italic">
          No session history available.
        </p>
      )}
    </section>
  );
}

export default RecentSessionsTable;
