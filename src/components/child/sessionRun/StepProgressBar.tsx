// src/components/child/sessionRun/StepProgressBar.tsx
// Progress bar component for session runner

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";
import { STEP_ORDER, STEP_LABELS } from "../../../types/child/sessionTypes";
import type { SessionStep } from "../../../types/child/sessionTypes";

type StepProgressBarProps = {
  currentStepIndex: number;
  totalSteps: number;
  steps: SessionStep[];
  timeRemainingMinutes: number | null;
};

const ICON_CLOCK: IconKey = "clock";
const ICON_CHECK: IconKey = "checkCircle";

export default function StepProgressBar({
  currentStepIndex,
  totalSteps,
  steps,
  timeRemainingMinutes,
}: StepProgressBarProps) {
  const safeTotal = Math.max(1, totalSteps);
  const safeCurrent = Math.min(Math.max(1, currentStepIndex), safeTotal);
  const progressPercent = (safeCurrent / safeTotal) * 100;

  return (
    <div className="bg-background border-b border-border py-4">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-muted-foreground text-sm">
            {STEP_LABELS[STEP_ORDER[safeCurrent - 1] ?? "preview"]}
          </p>

          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm">
              {safeCurrent} of {safeTotal} steps
            </span>

            {timeRemainingMinutes !== null && (
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <span className="text-xs" aria-hidden="true">
                  <AppIcon name={ICON_CLOCK} />
                </span>
                <span>~{timeRemainingMinutes} min left</span>
              </div>
            )}
          </div>
        </div>

        <div className="w-full bg-border rounded-full h-2 mb-4">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          {STEP_ORDER.map((stepKey, idx) => {
            const stepData = steps.find((s) => s.step_key === stepKey);
            const isComplete = stepData?.status === "completed";
            const isCurrent = idx + 1 === safeCurrent;

            return (
              <div key={stepKey} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isComplete
                      ? "bg-success"
                      : isCurrent
                      ? "bg-primary"
                      : "bg-border"
                  }`}
                  aria-hidden="true"
                >
                  {isComplete ? (
                    <span className="text-primary-foreground text-sm">
                      <AppIcon name={ICON_CHECK} />
                    </span>
                  ) : (
                    <span
                      className={`text-sm font-semibold ${
                        isCurrent ? "text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {idx + 1}
                    </span>
                  )}
                </div>

                <span
                  className={`text-xs mt-1 hidden md:block ${
                    isCurrent ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {STEP_LABELS[stepKey]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
