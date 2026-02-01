// src/components/parent/dashboard/FamilyOverviewCard.tsx
// Aggregate family stats card for Parent Dashboard v2 (FEAT-009)
// FEAT-010: AppIcon (lucide-react) + theme-ready classes (no FontAwesome, no hex)

import React from "react";
import AppIcon from "../../ui/AppIcon";
import type { FamilyOverviewCardProps } from "../../../types/parent/parentDashboardTypes";

export function FamilyOverviewCard({
  weekSummary,
  subjectCoverage,
  childrenCount,
}: FamilyOverviewCardProps) {
  const uniqueSubjects = new Set(subjectCoverage.map((sc) => sc.subject_id)).size;
  const totalSessions = weekSummary.sessions_completed;
  const totalMinutes = weekSummary.total_minutes;
  const avgPerChild =
    childrenCount > 0 ? Math.round(totalSessions / childrenCount) : 0;

  return (
    <div className="bg-neutral-0 rounded-2xl shadow-card p-6 border border-neutral-200/50">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-primary-900">Family Overview</h3>
        <span className="text-xs font-medium text-neutral-500">This week</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Total Sessions */}
        <div className="bg-primary-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AppIcon
              name="check-circle"
              className="w-4 h-4 text-accent-green"
              aria-hidden
            />
            <span className="text-xs font-medium text-neutral-600">
              Sessions
            </span>
          </div>
          <div className="text-2xl font-bold text-primary-900">
            {totalSessions}
          </div>
          <div className="text-xs text-neutral-500">completed</div>
        </div>

        {/* Total Time */}
        <div className="bg-primary-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AppIcon
              name="clock"
              className="w-4 h-4 text-primary-600"
              aria-hidden
            />
            <span className="text-xs font-medium text-neutral-600">Time</span>
          </div>
          <div className="text-2xl font-bold text-primary-900">
            {totalMinutes}
          </div>
          <div className="text-xs text-neutral-500">minutes total</div>
        </div>

        {/* Subjects Active */}
        <div className="bg-primary-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AppIcon
              name="book-open"
              className="w-4 h-4 text-primary-600"
              aria-hidden
            />
            <span className="text-xs font-medium text-neutral-600">
              Subjects
            </span>
          </div>
          <div className="text-2xl font-bold text-primary-900">
            {uniqueSubjects}
          </div>
          <div className="text-xs text-neutral-500">active</div>
        </div>

        {/* Avg Per Child */}
        <div className="bg-primary-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AppIcon
              name="user-plus"
              className="w-4 h-4 text-primary-600"
              aria-hidden
            />
            <span className="text-xs font-medium text-neutral-600">
              Average
            </span>
          </div>
          <div className="text-2xl font-bold text-primary-900">
            {avgPerChild}
          </div>
          <div className="text-xs text-neutral-500">per child</div>
        </div>
      </div>

      {/* Subject breakdown */}
      {subjectCoverage.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            Subject Coverage
          </div>
          <div className="space-y-2">
            {subjectCoverage.slice(0, 4).map((sc) => (
              <div
                key={`${sc.child_id}-${sc.subject_id}`}
                className="flex items-center gap-3"
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0 bg-neutral-300" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-primary-900 truncate">
                    {sc.subject_name}
                  </div>
                </div>
                <div className="text-sm font-semibold text-primary-900">
                  {sc.sessions_completed}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FamilyOverviewCard;
