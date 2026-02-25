// src/components/parent/insights/HeroStoryWidget.tsx
// FEAT-008: Hero Story Card - Weekly narrative and KPIs
// v2: Integrated date selector and export button

import AppIcon from "../../ui/AppIcon";
import type {
  InsightsSummary,
  TutorAdvice,
  DateRangeType,
} from "../../../types/parent/insightsDashboardTypes";

interface HeroStoryWidgetProps {
  childName: string;
  summary: InsightsSummary | null;
  advice: TutorAdvice | null;
  loading: boolean;
  dateRange: DateRangeType;
  onDateRangeChange: (range: DateRangeType) => void;
  onExport?: () => void;
  onActionClick?: (action: string) => void;
}

const DATE_RANGE_OPTIONS: { value: DateRangeType; label: string }[] = [
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "lifetime", label: "All Time" },
];

export default function HeroStoryWidget({
  childName,
  summary,
  advice,
  loading,
  dateRange,
  onDateRangeChange,
  onExport,
  onActionClick,
}: HeroStoryWidgetProps) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-primary/5 via-white to-primary/5 rounded-2xl shadow-sm p-8 border border-primary/20 animate-pulse">
        <div className="h-8 bg-primary/10 rounded w-1/3 mb-4" />
        <div className="h-4 bg-primary/10 rounded w-2/3 mb-8" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 bg-background rounded-xl" />
          <div className="h-24 bg-background rounded-xl" />
          <div className="h-24 bg-background rounded-xl" />
        </div>
      </div>
    );
  }

  const sessions = summary?.sessions;
  const confidence = summary?.confidence;
  const focusMode = summary?.focus_mode;
  const confidenceChangePercent = confidence?.avg_change_percent || 0;
  const isConfidencePositive = confidenceChangePercent > 0;

  return (
    <div className="bg-gradient-to-br from-primary/5 via-white to-primary/5 rounded-2xl shadow-sm p-8 border border-primary/20">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-primary mb-2">This Week's Story</h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            {advice?.weekly_story || `${childName} is building revision habits.`}
          </p>
        </div>

        <div className="flex items-center space-x-3 ml-4">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value as DateRangeType)}
              className="appearance-none bg-background border border-border rounded-lg px-4 py-2 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            >
              {DATE_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
              <AppIcon name="chevron-down" className="w-4 h-4" />
            </span>
          </div>

          <button
            onClick={onExport}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-sm font-medium flex items-center space-x-2"
          >
            <AppIcon name="arrow-right" className="w-4 h-4 rotate-[-90deg]" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-background rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Sessions Completed</span>
            <AppIcon
              name="check-circle"
              className={`w-5 h-5 ${
                sessions?.completed === sessions?.planned ? "text-success" : "text-muted-foreground"
              }`}
            />
          </div>
          <div className="text-3xl font-bold text-primary">
            {sessions?.completed || 0}/{sessions?.planned || 0}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {sessions?.completion_rate || 0}% completion rate
          </div>
        </div>

        <div className="bg-background rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg Confidence Change</span>
            <AppIcon
              name={isConfidencePositive ? "sparkles" : "triangle-alert"}
              className={`w-5 h-5 ${
                isConfidencePositive ? "text-success" : "text-warning"
              }`}
            />
          </div>
          <div
            className={`text-3xl font-bold ${
              isConfidencePositive ? "text-success" : "text-warning"
            }`}
          >
            {isConfidencePositive ? "+" : ""}
            {confidenceChangePercent}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">Pre → Post session growth</div>
        </div>

        <div className="bg-background rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Focus Mode Usage</span>
            <AppIcon name="bolt" className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold text-primary">
            {focusMode?.sessions_with_focus || 0}/{focusMode?.total_sessions || 0}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Used in {focusMode?.usage_rate || 0}% of sessions
          </div>
        </div>
      </div>

      {advice && (
        <div className="bg-background rounded-xl p-5 border-2 border-primary/50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <AppIcon name="lightbulb" className="w-4 h-4 text-warning" />
                <h3 className="font-semibold text-foreground">Next Best Action</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {advice.next_best_action?.description || "Keep up the current routine."}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => onActionClick?.("adjust-plan")}
                  className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium text-sm"
                >
                  Adjust Next Week's Plan
                </button>
                <button
                  onClick={() => onActionClick?.("keep-plan")}
                  className="px-5 py-2.5 bg-background border-2 border-border text-foreground rounded-lg hover:bg-muted transition font-medium text-sm"
                >
                  Keep Plan As-Is
                </button>
                <button
                  onClick={() => onActionClick?.("review-topics")}
                  className="px-5 py-2.5 bg-background border-2 border-border text-foreground rounded-lg hover:bg-muted transition font-medium text-sm"
                >
                  Review Tricky Topics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
