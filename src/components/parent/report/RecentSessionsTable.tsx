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
      <h2 className="text-xl font-bold text-primary-900 mb-4">
        Recent Session History
      </h2>

      {recentSessions.length > 0 ? (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200/60">
              <th className="text-left py-2 px-3 font-semibold text-primary-700">
                Date
              </th>
              <th className="text-left py-2 px-3 font-semibold text-primary-700">
                Topic
              </th>
              <th className="text-left py-2 px-3 font-semibold text-primary-700">
                Subject
              </th>
              <th className="text-center py-2 px-3 font-semibold text-primary-700">
                Before
              </th>
              <th className="text-center py-2 px-3 font-semibold text-primary-700">
                After
              </th>
            </tr>
          </thead>

          <tbody>
            {recentSessions.map((session, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? "bg-neutral-0" : "bg-neutral-50"}
              >
                <td className="py-2 px-3 text-neutral-600">
                  {formatReportDate(session.date)}
                </td>
                <td className="py-2 px-3 font-medium text-primary-900">
                  {session.topic_name}
                </td>
                <td className="py-2 px-3 text-neutral-600">
                  {session.subject_name}
                </td>
                <td className="py-2 px-3 text-center text-neutral-600">
                  {getConfidenceLabel(session.pre_confidence)}
                </td>
                <td className="py-2 px-3 text-center text-neutral-600">
                  {getConfidenceLabel(session.post_confidence)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-neutral-500 italic">
          No session history available.
        </p>
      )}
    </section>
  );
}

export default RecentSessionsTable;
