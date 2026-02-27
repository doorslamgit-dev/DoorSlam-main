// src/components/child/sessionRun/StepProgressBar.tsx
// Progress bar component for session runner

import { STEP_ORDER, STEP_LABELS } from "../../../types/child/sessionTypes";

type StepProgressBarProps = {
  currentStepIndex: number;
  totalSteps: number;
};

export default function StepProgressBar({
  currentStepIndex,
  totalSteps,
}: StepProgressBarProps) {
  const safeTotal = Math.max(1, totalSteps);
  const safeCurrent = Math.min(Math.max(1, currentStepIndex), safeTotal);
  const progressPercent = (safeCurrent / safeTotal) * 100;

  return (
    <div className="bg-background border-b border-border py-3">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-muted-foreground text-sm">
            {STEP_LABELS[STEP_ORDER[safeCurrent - 1] ?? "preview"]}
          </p>

          <span className="text-muted-foreground text-sm">
            {safeCurrent} of {safeTotal} steps
          </span>
        </div>

        <div className="w-full bg-border rounded-full h-2">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
