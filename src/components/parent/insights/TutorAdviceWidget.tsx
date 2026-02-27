// src/components/parent/insights/TutorAdviceWidget.tsx
// FEAT-008: AI Tutor Advice - Personalized guidance

import AppIcon from "../../ui/AppIcon";
import type { TutorAdvice } from "../../../types/parent/insightsDashboardTypes";

interface TutorAdviceWidgetProps {
  advice: TutorAdvice | null;
  loading: boolean;
  isAIGenerated?: boolean;
}

export default function TutorAdviceWidget({
  advice,
  loading,
  isAIGenerated = false,
}: TutorAdviceWidgetProps) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-primary/90 to-primary/80 rounded-2xl shadow-sm p-8 border border-primary animate-pulse">
        <div className="h-8 bg-primary rounded w-1/3 mb-6" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-40 bg-primary rounded-xl" />
          <div className="h-40 bg-primary rounded-xl" />
        </div>
      </div>
    );
  }

  if (!advice) {
    return (
      <div className="bg-gradient-to-br from-primary/90 to-primary/80 rounded-2xl shadow-sm p-8 border border-primary text-primary-foreground">
        <div className="text-center py-8">
          <AppIcon name="sparkles" className="w-10 h-10 text-primary-foreground/60 mx-auto mb-4" />
          <p className="text-primary-foreground/80">
            Complete more sessions to unlock tutor advice
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/90 to-primary/80 rounded-2xl shadow-sm p-8 border border-primary text-primary-foreground">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <AppIcon name="sparkles" className="w-6 h-6 text-primary-foreground/60" />
            <h3 className="text-2xl font-bold">Your Tutor Advises</h3>
            {isAIGenerated && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary rounded-full text-xs">
                <AppIcon name="wand-sparkles" className="w-4 h-4 text-warning" />
                AI
              </span>
            )}
          </div>
          <p className="text-primary-foreground/80">Practical support strategies for this week</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
          <h4 className="font-semibold text-primary-foreground mb-3 flex items-center space-x-2">
            <AppIcon name="lightbulb" className="w-4 h-4 text-yellow-300" />
            <span>This Week's Focus</span>
          </h4>
          <ul className="space-y-3 text-sm text-primary-foreground/80">
            {advice.focus_points?.map((point, index) => (
              <li key={index} className="flex items-start space-x-2">
                <AppIcon name="check" className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
          <h4 className="font-semibold text-primary-foreground mb-3 flex items-center space-x-2">
            <AppIcon name="triangle-alert" className="w-4 h-4 text-warning" />
            <span>Watch Out For</span>
          </h4>
          <ul className="space-y-3 text-sm text-primary-foreground/80">
            {advice.watch_out_for?.map((item, index) => (
              <li key={index} className="flex items-start space-x-2">
                <AppIcon name="triangle-alert" className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-background rounded-xl p-6">
        <h4 className="font-semibold text-foreground mb-4 flex items-center space-x-2">
          <AppIcon name="message-circle" className="w-5 h-5 text-primary" />
          <span>Try Saying...</span>
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-muted rounded-lg border border-border">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <AppIcon name="x" className="w-4 h-4 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  <strong>Instead of:</strong> "{advice.try_saying?.instead_of}"
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-success/5 rounded-lg border border-success/20">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <AppIcon name="check" className="w-4 h-4 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">
                  <strong>Try saying:</strong> "{advice.try_saying?.try_this}"
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-semibold text-foreground mb-3 text-sm">When to Step In</h5>
            <ul className="space-y-2 text-sm text-foreground">
              {advice.step_in_signals?.map((signal, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <AppIcon name="circle" className="w-2 h-2 text-primary mt-1.5" />
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-foreground mb-3 text-sm">When to Step Back</h5>
            <ul className="space-y-2 text-sm text-foreground">
              {advice.step_back_signals?.map((signal, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <AppIcon name="circle" className="w-2 h-2 text-success mt-1.5" />
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
