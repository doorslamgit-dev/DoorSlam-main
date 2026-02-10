// src/components/parentOnboarding/availability/CoverageCard.tsx
// Coverage feedback card showing progress toward targets
// Extracted from AvailabilityBuilderStep for better maintainability

import { useState } from "react";
import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";
import {
  getCoverageStatusInfo,
  type CoverageDistributionResult,
  type SessionsForCoverageResult,
  type FeasibilityResult,
} from "../../../services/parentOnboarding/coverageService";

/* ============================
   Helper Functions
============================ */

function getProgressBarColor(coverage: number, priorityTier: string): string {
  if (priorityTier === "high") {
    return coverage >= 85 ? "bg-accent-green" : coverage >= 65 ? "bg-accent-amber" : "bg-accent-red";
  } else if (priorityTier === "medium") {
    return coverage >= 70 ? "bg-accent-green" : coverage >= 50 ? "bg-accent-amber" : "bg-accent-red";
  } else {
    return coverage >= 50 ? "bg-accent-green" : coverage >= 30 ? "bg-accent-amber" : "bg-accent-red";
  }
}

function getPriorityBadge(tier: string): { label: string; className: string } {
  switch (tier) {
    case "high":
      return { label: "High", className: "bg-accent-red/15 text-accent-red" };
    case "medium":
      return { label: "Medium", className: "bg-accent-amber/15 text-accent-amber" };
    default:
      return { label: "Low", className: "bg-primary-100 text-primary-700" };
  }
}

function coverageStatusIconKey(status: string): IconKey {
  switch (status) {
    case "excellent":
    case "good":
      return "badge-check";
    case "adequate":
      return "alert-circle";
    default:
      return "x-circle";
  }
}

/* ============================
   Component
============================ */

export interface CoverageCardProps {
  coverage: CoverageDistributionResult;
  required: SessionsForCoverageResult;
  feasibility: FeasibilityResult;
}

export function CoverageCard({ coverage, required: _required, feasibility }: CoverageCardProps) {
  const statusInfo = getCoverageStatusInfo(coverage.coverage_status);
  const [showDetails, setShowDetails] = useState(false);

  const iconKey = coverageStatusIconKey(coverage.coverage_status);
  const iconBg =
    coverage.coverage_status === "excellent" || coverage.coverage_status === "good"
      ? "bg-accent-green/15"
      : coverage.coverage_status === "adequate"
      ? "bg-accent-amber/15"
      : "bg-accent-red/15";

  return (
    <div className={`rounded-xl border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
            <AppIcon name={iconKey} className={`w-5 h-5 ${statusInfo.color}`} aria-hidden />
          </div>
          <div className="flex-1">
            <h3 className={`text-sm font-semibold ${statusInfo.color}`}>{statusInfo.label}</h3>
            <p className="text-xs text-neutral-600">
              {coverage.overall_coverage_percent}% weighted coverage
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-neutral-900">
              {Math.round(coverage.overall_coverage_percent)}%
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-white/50 rounded-lg">
            <div className="text-lg font-semibold text-neutral-900">
              {coverage.available_sessions}
            </div>
            <div className="text-[10px] text-neutral-500 uppercase">Sessions</div>
          </div>
          <div className="p-2 bg-white/50 rounded-lg">
            <div className="text-lg font-semibold text-neutral-900">
              {coverage.total_topics_covered}
            </div>
            <div className="text-[10px] text-neutral-500 uppercase">Topics</div>
          </div>
          <div className="p-2 bg-white/50 rounded-lg">
            <div className="text-lg font-semibold text-neutral-900">{coverage.subjects.length}</div>
            <div className="text-[10px] text-neutral-500 uppercase">Subjects</div>
          </div>
        </div>

        {/* Suggestion */}
        {feasibility.suggestion && (
          <div className="mt-4 p-3 bg-white/50 rounded-lg">
            <div className="flex items-start gap-2">
              <AppIcon name="lightbulb" className="w-4 h-4 text-primary-600 mt-0.5" aria-hidden />
              <p className="text-xs text-neutral-700">{feasibility.suggestion}</p>
            </div>
          </div>
        )}

        {/* Toggle details */}
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="mt-4 w-full text-xs text-neutral-600 hover:text-neutral-800 font-medium flex items-center justify-center gap-2"
        >
          {showDetails ? (
            <>
              <AppIcon name="chevron-up" className="w-4 h-4" aria-hidden />
              Hide subject breakdown
            </>
          ) : (
            <>
              <AppIcon name="chevron-down" className="w-4 h-4" aria-hidden />
              Show subject breakdown
            </>
          )}
        </button>
      </div>

      {/* Subject breakdown */}
      {showDetails && (
        <div className="border-t border-neutral-200/50 p-4 space-y-3">
          {coverage.subjects
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((subject) => {
              const badge = getPriorityBadge(subject.priority_tier);
              const barColor = getProgressBarColor(
                subject.coverage_percent,
                subject.priority_tier
              );

              return (
                <div key={subject.subject_id} className="p-3 bg-neutral-0 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-900">
                        {subject.subject_name}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900">
                      {Math.round(subject.coverage_percent)}%
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} transition-all duration-300`}
                      style={{ width: `${Math.min(100, subject.coverage_percent)}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-neutral-500">
                    <span>
                      {subject.topics_covered}/{subject.topic_count} topics
                    </span>
                    <span>{subject.allocated_sessions} sessions</span>
                  </div>
                </div>
              );
            })}

          {/* Explanation */}
          <div className="pt-2 text-[10px] text-neutral-500">
            <p>
              <strong>High priority</strong> subjects get more sessions automatically. 100% coverage
              isn't always needed — focus matters more than breadth.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
