// src/components/child/sessionRun/SessionHeader.tsx
// Header component for session runner

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";
import { STEP_ORDER, STEP_LABELS } from "../../../types/child/sessionTypes";
import type { SessionStep } from "../../../types/child/sessionTypes";

export type SessionHeaderProps = {
  subjectName: string;
  subjectIcon: IconKey | string;
  /** CSS class like "bg-subject-maths" or inline color like "#5B2CFF" */
  subjectColor?: string;
  /** @deprecated Use subjectColor instead */
  subjectColorClass?: string;
  topicName: string;
  onExit: () => void;
  currentStepIndex?: number;
  steps?: SessionStep[];
  timeRemainingMinutes?: number | null;
};

export default function SessionHeader({
  subjectName,
  subjectIcon: _subjectIcon,
  subjectColor,
  subjectColorClass,
  topicName,
  onExit,
  currentStepIndex,
  steps,
  timeRemainingMinutes,
}: SessionHeaderProps) {
  // Support both CSS class and inline color
  const colorValue = subjectColor || subjectColorClass;
  const _isInlineColor = colorValue?.startsWith("#") || colorValue?.startsWith("rgb");

  return (
    <header className="bg-background border-b border-border sticky top-0 z-40">
      <div className="max-w-[1120px] mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* Left: subject name/topic */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="min-w-0">
            <p className="text-xl font-bold text-foreground leading-tight">{subjectName}</p>
            <p className="text-muted-foreground text-sm truncate max-w-[200px] leading-tight">
              {topicName}
            </p>
          </div>
        </div>

        {/* Center: step circles */}
        {steps && currentStepIndex !== undefined && (
          <div className="hidden md:flex items-end shrink-0">
            {STEP_ORDER.map((stepKey, idx) => {
              const stepData = steps.find((s) => s.step_key === stepKey);
              const isComplete = stepData?.status === "completed";
              const isCurrent = idx + 1 === currentStepIndex;

              return (
                <div key={stepKey} className="flex flex-col items-center w-16">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isComplete
                        ? "bg-success"
                        : isCurrent
                        ? "bg-primary"
                        : "bg-border"
                    }`}
                    aria-hidden="true"
                  >
                    {isComplete ? (
                      <AppIcon name="check" className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <span
                        className={`text-xs font-semibold ${
                          isCurrent ? "text-primary-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 text-center leading-tight ${
                      isCurrent ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {STEP_LABELS[stepKey]}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Right: time remaining + exit button */}
        <div className="flex items-center justify-end gap-3 flex-1">
          {timeRemainingMinutes != null && (
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <AppIcon name="clock" className="w-4 h-4" aria-hidden />
              <span>~{timeRemainingMinutes} min left</span>
            </div>
          )}
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition"
          >
            <AppIcon name="close" aria-hidden />
            <span className="font-medium">Exit</span>
          </button>
        </div>

      </div>
    </header>
  );
}
