// src/components/parentOnboarding/CoveragePreview.tsx
// Displays coverage breakdown per subject with visual progress bars

import { useMemo } from "react";
import AppIcon from "../ui/AppIcon";
import {
  type CoverageDistributionResult,
  type SubjectCoverage,
  type CoverageStatus,
  getCoverageStatusInfo,
} from "../../services/parentOnboarding/coverageService";

/* ============================
   Types
============================ */

interface CoveragePreviewProps {
  coverage: CoverageDistributionResult;
  totalWeeks: number;
  compact?: boolean;
}

interface SubjectRowProps {
  subject: SubjectCoverage;
  compact?: boolean;
}

/* ============================
   Helper Functions
============================ */

function getProgressBarColor(coverage: number, priorityTier: string): string {
  // High priority needs higher coverage to be "good"
  const threshold = priorityTier === "high" ? 80 : priorityTier === "medium" ? 60 : 40;

  if (coverage >= threshold + 15) return "bg-success";
  if (coverage >= threshold) return "bg-success";
  if (coverage >= threshold - 15) return "bg-warning";
  return "bg-destructive";
}

function getPriorityLabel(tier: string): { label: string; color: string } {
  switch (tier) {
    case "high":
      return { label: "High", color: "text-primary bg-primary/10" };
    case "medium":
      return { label: "Medium", color: "text-warning bg-warning/10" };
    case "low":
      return { label: "Low", color: "text-muted-foreground bg-secondary" };
    default:
      return { label: tier, color: "text-muted-foreground bg-secondary" };
  }
}

/**
 * coverageService currently returns FontAwesome-ish icon strings (e.g. "fa-check", "fa-triangle-exclamation").
 * We keep that contract and map the common ones to AppIcon names here.
 */
function faToAppIconName(fa: string | null | undefined): string {
  const raw = String(fa || "").trim();
  const name = raw.startsWith("fa-") ? raw.slice(3) : raw;

  switch (name) {
    case "check":
    case "check-circle":
    case "circle-check":
      return "check";
    case "triangle-exclamation":
    case "exclamation-triangle":
      return "triangle-alert";
    case "circle-info":
    case "info-circle":
      return "info";
    case "xmark":
    case "times":
      return "x";
    default:
      return "info";
  }
}

/* ============================
   Subject Row Component
============================ */

function SubjectRow({ subject, compact = false }: SubjectRowProps) {
  const priority = getPriorityLabel(subject.priority_tier);
  const barColor = getProgressBarColor(subject.coverage_percent, subject.priority_tier);

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground truncate">
              {subject.subject_name}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${priority.color}`}>
              {priority.label}
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor} transition-all duration-500`}
              style={{ width: `${Math.min(100, subject.coverage_percent)}%` }}
            />
          </div>
        </div>
        <div className="text-right flex-shrink-0 w-14">
          <span className="text-sm font-semibold text-foreground">
            {Math.round(subject.coverage_percent)}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-background rounded-xl border border-border">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-foreground truncate">
              {subject.subject_name}
            </h4>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${priority.color}`}>
              {priority.label} priority
            </span>
          </div>
          {subject.grade_gap > 0 && (
            <p className="text-xs text-muted-foreground">
              Grade {subject.current_grade ?? "?"} → {subject.target_grade ?? "?"}
              <span className="ml-1 text-muted-foreground">
                ({subject.grade_gap} level{subject.grade_gap !== 1 ? "s" : ""} to improve)
              </span>
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <div className="text-2xl font-bold text-foreground">
            {Math.round(subject.coverage_percent)}%
          </div>
          <div className="text-xs text-muted-foreground">coverage</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-secondary rounded-full overflow-hidden mb-3">
        <div
          className={`h-full ${barColor} transition-all duration-500`}
          style={{ width: `${Math.min(100, subject.coverage_percent)}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {subject.topics_covered} of {subject.topic_count} topics
        </span>
        <span>{subject.allocated_sessions} sessions allocated</span>
      </div>
    </div>
  );
}

/* ============================
   Overall Status Component
============================ */

function OverallStatus({ status, percent }: { status: CoverageStatus; percent: number }) {
  const info = getCoverageStatusInfo(status);
  const iconName = faToAppIconName(info.icon);

  const circleBg =
    status === "excellent" || status === "good"
      ? "bg-success/10"
      : status === "adequate"
      ? "bg-warning/10"
      : "bg-destructive/10";

  return (
    <div className={`p-4 rounded-xl border ${info.bgColor} ${info.borderColor}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${circleBg}`}>
          <AppIcon name={iconName} className={`w-5 h-5 ${info.color}`} aria-hidden />
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-semibold ${info.color}`}>{info.label}</h3>
          <p className="text-xs text-muted-foreground">{percent}% weighted average across all subjects</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-foreground">{Math.round(percent)}%</div>
        </div>
      </div>
    </div>
  );
}

/* ============================
   Main Component
============================ */

export default function CoveragePreview({
  coverage,
  totalWeeks,
  compact = false,
}: CoveragePreviewProps) {
  // Keep UI order aligned with the parent "priority/order" step (sort_order)
  const sortedSubjects = useMemo(() => {
    return [...coverage.subjects].sort((a, b) => a.sort_order - b.sort_order);
  }, [coverage.subjects]);

  // Group by priority tier (for expanded view sections)
  const groupedSubjects = useMemo(() => {
    const groups: Record<string, SubjectCoverage[]> = { high: [], medium: [], low: [] };
    for (const subject of sortedSubjects) {
      if (!groups[subject.priority_tier]) groups[subject.priority_tier] = [];
      groups[subject.priority_tier].push(subject);
    }
    return groups;
  }, [sortedSubjects]);

  if (compact) {
    return (
      <div className="space-y-1">
        {sortedSubjects.map((subject) => (
          <SubjectRow key={subject.subject_id} subject={subject} compact />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall status */}
      <OverallStatus status={coverage.coverage_status} percent={coverage.overall_coverage_percent} />

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-xl border border-border">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{coverage.available_sessions}</div>
          <div className="text-xs text-muted-foreground">sessions planned</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{coverage.total_topics_covered}</div>
          <div className="text-xs text-muted-foreground">topics covered</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {Math.round(coverage.available_sessions / Math.max(1, totalWeeks))}
          </div>
          <div className="text-xs text-muted-foreground">per week</div>
        </div>
      </div>

      {/* Subjects by priority */}
      {groupedSubjects.high?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <h3 className="text-sm font-semibold text-foreground">High Priority Subjects</h3>
            <span className="text-xs text-muted-foreground">(Target: 90%+ coverage)</span>
          </div>
          <div className="space-y-3">
            {groupedSubjects.high.map((subject) => (
              <SubjectRow key={subject.subject_id} subject={subject} />
            ))}
          </div>
        </div>
      )}

      {groupedSubjects.medium?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <h3 className="text-sm font-semibold text-foreground">Medium Priority Subjects</h3>
            <span className="text-xs text-muted-foreground">(Target: 70%+ coverage)</span>
          </div>
          <div className="space-y-3">
            {groupedSubjects.medium.map((subject) => (
              <SubjectRow key={subject.subject_id} subject={subject} />
            ))}
          </div>
        </div>
      )}

      {groupedSubjects.low?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Lower Priority Subjects</h3>
            <span className="text-xs text-muted-foreground">(Target: 50%+ coverage)</span>
          </div>
          <div className="space-y-3">
            {groupedSubjects.low.map((subject) => (
              <SubjectRow key={subject.subject_id} subject={subject} />
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className="p-4 bg-muted rounded-xl border border-border">
        <div className="flex items-start gap-3">
          <AppIcon name="info" className="w-5 h-5 text-muted-foreground mt-0.5" aria-hidden />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>High priority subjects</strong> receive the most study time. Coverage shows
              what percentage of topics will be studied at least once.
            </p>
            <p>
              <strong>100% coverage isn't always needed</strong> — focusing on high-priority
              subjects and key topics often produces better results than trying to cover everything
              equally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
