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
    return coverage >= 85 ? "bg-success" : coverage >= 65 ? "bg-warning" : "bg-destructive";
  } else if (priorityTier === "medium") {
    return coverage >= 70 ? "bg-success" : coverage >= 50 ? "bg-warning" : "bg-destructive";
  } else {
    return coverage >= 50 ? "bg-success" : coverage >= 30 ? "bg-warning" : "bg-destructive";
  }
}

function getPriorityBadge(tier: string): { label: string; className: string } {
  switch (tier) {
    case "high":
      return { label: "High", className: "bg-destructive/15 text-destructive" };
    case "medium":
      return { label: "Medium", className: "bg-warning/15 text-warning" };
    default:
      return { label: "Low", className: "bg-primary/10 text-primary" };
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
      ? "bg-success/15"
      : coverage.coverage_status === "adequate"
      ? "bg-warning/15"
      : "bg-destructive/15";

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
            <p className="text-xs text-muted-foreground">
              {coverage.overall_coverage_percent}% weighted coverage
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-foreground">
              {Math.round(coverage.overall_coverage_percent)}%
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-white/50 rounded-lg">
            <div className="text-lg font-semibold text-foreground">
              {coverage.available_sessions}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase">Sessions</div>
          </div>
          <div className="p-2 bg-white/50 rounded-lg">
            <div className="text-lg font-semibold text-foreground">
              {coverage.total_topics_covered}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase">Topics</div>
          </div>
          <div className="p-2 bg-white/50 rounded-lg">
            <div className="text-lg font-semibold text-foreground">{coverage.subjects.length}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Subjects</div>
          </div>
        </div>

        {/* Suggestion */}
        {feasibility.suggestion && (
          <div className="mt-4 p-3 bg-white/50 rounded-lg">
            <div className="flex items-start gap-2">
              <AppIcon name="lightbulb" className="w-4 h-4 text-primary mt-0.5" aria-hidden />
              <p className="text-xs text-foreground">{feasibility.suggestion}</p>
            </div>
          </div>
        )}

        {/* Toggle details */}
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground font-medium flex items-center justify-center gap-2"
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
        <div className="border-t border-border/50 p-4 space-y-3">
          {coverage.subjects
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((subject) => {
              const badge = getPriorityBadge(subject.priority_tier);
              const barColor = getProgressBarColor(
                subject.coverage_percent,
                subject.priority_tier
              );

              return (
                <div key={subject.subject_id} className="p-3 bg-background rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {subject.subject_name}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {Math.round(subject.coverage_percent)}%
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} transition-all duration-300`}
                      style={{ width: `${Math.min(100, subject.coverage_percent)}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                    <span>
                      {subject.topics_covered}/{subject.topic_count} topics
                    </span>
                    <span>{subject.allocated_sessions} sessions</span>
                  </div>
                </div>
              );
            })}

          {/* Explanation */}
          <div className="pt-2 text-[10px] text-muted-foreground">
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
