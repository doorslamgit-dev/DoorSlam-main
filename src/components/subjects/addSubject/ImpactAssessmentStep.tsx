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
      return "text-success bg-success/10 border-success-border";
    case "tight_but_ok":
      return "text-info bg-info/10 border-info-border";
    case "add_sessions":
      return "text-warning bg-warning/10 border-warning-border";
    case "prioritize":
      return "text-destructive bg-destructive/10 border-danger-border";
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

export default function ImpactAssessmentStep({
  impactAssessment,
  loadingImpact,
}: ImpactAssessmentStepProps) {
  return (
    <div className="space-y-6">
      {loadingImpact ? (
        <div className="flex items-center justify-center py-12">
          <AppIcon
            name="loader"
            className="w-6 h-6 text-primary animate-spin"
          />
        </div>
      ) : impactAssessment ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {impactAssessment.current_weekly_sessions}
              </div>
              <div className="text-sm text-muted-foreground">
                Sessions/week
              </div>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {impactAssessment.total_topics}
              </div>
              <div className="text-sm text-muted-foreground">Total topics</div>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {impactAssessment.coverage_percent}%
              </div>
              <div className="text-sm text-muted-foreground">Coverage</div>
            </div>
          </div>

          {/* Topic Breakdown */}
          <div className="bg-muted rounded-xl p-4">
            <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <AppIcon
                name="chart-line"
                className="w-4 h-4 text-primary"
              />
              Topic Breakdown
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Existing subjects</span>
                <span className="font-medium">
                  {impactAssessment.existing_topic_count} topics
                </span>
              </div>
              <div className="flex justify-between text-primary">
                <span>New subjects</span>
                <span className="font-medium">
                  +{impactAssessment.new_topic_count} topics
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-medium">
                <span className="text-foreground">Total</span>
                <span>{impactAssessment.total_topics} topics</span>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div
            className={`rounded-xl border p-4 ${getRecommendationColor(
              impactAssessment.recommendation
            )}`}
          >
            <div className="flex items-start gap-3">
              <AppIcon
                name={getRecommendationIconName(
                  impactAssessment.recommendation
                )}
                className="w-5 h-5 mt-0.5"
                aria-hidden={true}
              />
              <div>
                <h3 className="font-semibold mb-1">
                  {impactAssessment.recommendation === "on_track" &&
                    "Looking good!"}
                  {impactAssessment.recommendation === "tight_but_ok" &&
                    "Coverage is tight"}
                  {impactAssessment.recommendation === "add_sessions" &&
                    "Consider adding sessions"}
                  {impactAssessment.recommendation === "prioritize" &&
                    "Prioritization important"}
                </h3>
                <p className="text-sm">
                  {impactAssessment.recommendation_detail}
                </p>
                {impactAssessment.additional_sessions_needed > 0 && (
                  <p className="text-sm mt-2 font-medium">
                    Suggested: Add {impactAssessment.additional_sessions_needed}{" "}
                    session
                    {impactAssessment.additional_sessions_needed !== 1
                      ? "s"
                      : ""}{" "}
                    per week
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sessions info */}
          <div className="text-sm text-muted-foreground text-center">
            <p>
              {impactAssessment.total_available_sessions} total sessions over{" "}
              {impactAssessment.weeks_in_plan} weeks
            </p>
            <p>
              ≈ {impactAssessment.sessions_per_topic.toFixed(1)} sessions per topic
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Unable to load impact assessment
        </div>
      )}
    </div>
  );
}
