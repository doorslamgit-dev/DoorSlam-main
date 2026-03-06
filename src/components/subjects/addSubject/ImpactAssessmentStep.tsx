// src/components/subjects/addSubject/ImpactAssessmentStep.tsx
// Step component for displaying the impact assessment of adding new subjects
// Shows coverage stats, topic breakdown, and recommendations

import AppIcon from "../../ui/AppIcon";
import { type ImpactAssessment } from "../../../services/addSubjectService";

interface ImpactAssessmentStepProps {
  impactAssessment: ImpactAssessment | null;
  loadingImpact: boolean;
}

// Helper function to get color classes for recommendation type
const getRecommendationColor = (rec: string) => {
  switch (rec) {
    case "on_track":
      return "text-success bg-success/10 border-success/20";
    case "tight_but_ok":
      return "text-info bg-info/10 border-info/20";
    case "add_sessions":
      return "text-warning bg-warning/10 border-warning/20";
    case "prioritize":
      return "text-destructive bg-destructive/10 border-destructive/20";
    default:
      return "text-foreground bg-muted border-border";
  }
};

// Helper function to get icon name for recommendation type
const getRecommendationIconName = (rec: string) => {
  switch (rec) {
    case "on_track":
      return "check-circle" as const;
    case "tight_but_ok":
      return "info" as const;
    case "add_sessions":
    case "prioritize":
      return "triangle-alert" as const;
    default:
      return "info" as const;
  }
};

// Helper to get a sensible recommendation heading
const getRecommendationHeading = (rec: string) => {
  switch (rec) {
    case "on_track":
      return "Looking good!";
    case "tight_but_ok":
      return "Coverage is tight";
    case "add_sessions":
      return "Consider adding sessions";
    case "prioritize":
      return "Prioritisation recommended";
    default:
      return "Plan impact";
  }
};

export default function ImpactAssessmentStep({
  impactAssessment,
  loadingImpact,
}: ImpactAssessmentStepProps) {
  if (loadingImpact) {
    return (
      <div className="flex items-center justify-center py-12">
        <AppIcon
          name="loader"
          className="w-6 h-6 text-primary animate-spin"
        />
      </div>
    );
  }

  if (!impactAssessment) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Unable to load impact assessment
      </div>
    );
  }

  const {
    current_weekly_sessions,
    weeks_in_plan,
    total_available_sessions,
    existing_topic_count,
    new_topic_count,
    total_topics,
    coverage_percent,
    sessions_per_topic,
    recommendation,
    recommendation_detail,
    additional_sessions_needed,
  } = impactAssessment;

  // Cap the "additional sessions" suggestion at a reasonable max (e.g. 10/week)
  // so we don't show nonsensical numbers like "add 45 sessions per week"
  const MAX_REASONABLE_ADDITIONAL = 10;
  const cappedAdditional = Math.min(
    additional_sessions_needed,
    MAX_REASONABLE_ADDITIONAL
  );
  const isCapped = additional_sessions_needed > MAX_REASONABLE_ADDITIONAL;

  return (
    <div className="space-y-6">
      {/* Summary Stats — clarified labels */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-muted rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {current_weekly_sessions}
          </div>
          <div className="text-xs text-muted-foreground leading-tight">
            Current sessions/week
          </div>
        </div>
        <div className="bg-muted rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {total_topics}
          </div>
          <div className="text-xs text-muted-foreground leading-tight">
            Total topics
            <br />
            (all subjects)
          </div>
        </div>
        <div className="bg-muted rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {coverage_percent}%
          </div>
          <div className="text-xs text-muted-foreground leading-tight">
            Estimated coverage
          </div>
        </div>
      </div>

      {/* Topic Breakdown */}
      <div className="bg-muted rounded-xl p-4">
        <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
          <AppIcon
            name="chart-line"
            className="w-4 h-4 text-primary"
          />
          Topic breakdown
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Existing subjects
            </span>
            <span className="font-medium">
              {existing_topic_count} topics
            </span>
          </div>
          <div className="flex justify-between text-primary">
            <span>New subjects</span>
            <span className="font-medium">
              +{new_topic_count} topics
            </span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between font-medium">
            <span className="text-foreground">Total</span>
            <span>{total_topics} topics</span>
          </div>
        </div>
      </div>

      {/* Schedule context */}
      <div className="bg-muted rounded-xl p-4">
        <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
          <AppIcon
            name="calendar"
            className="w-4 h-4 text-primary"
          />
          Current schedule
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plan length</span>
            <span className="font-medium">{weeks_in_plan} weeks</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Total sessions in plan
            </span>
            <span className="font-medium">{total_available_sessions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Sessions per topic
            </span>
            <span className="font-medium">
              {sessions_per_topic > 0
                ? `≈ ${sessions_per_topic.toFixed(1)}`
                : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div
        className={`rounded-xl border p-4 ${getRecommendationColor(
          recommendation
        )}`}
      >
        <div className="flex items-start gap-3">
          <AppIcon
            name={getRecommendationIconName(recommendation)}
            className="w-5 h-5 mt-0.5"
            aria-hidden={true}
          />
          <div>
            <h3 className="font-semibold mb-1">
              {getRecommendationHeading(recommendation)}
            </h3>
            <p className="text-sm">{recommendation_detail}</p>

            {additional_sessions_needed > 0 && (
              <p className="text-sm mt-2 font-medium">
                {isCapped ? (
                  <>
                    Your schedule needs significant expansion to cover all{" "}
                    {total_topics} topics. Consider adding more sessions or
                    prioritising key subjects.
                  </>
                ) : (
                  <>
                    Suggested: Add {cappedAdditional} session
                    {cappedAdditional !== 1 ? "s" : ""} per week
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
