// src/components/child/session/StepIntroScreen.tsx
// Shared intro card used at the start of each session step

import type { ReactNode } from "react";
import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

interface StepIntroScreenProps {
  icon: IconKey;
  title: string;
  /** First paragraph — accepts JSX to allow highlighted topic name */
  description: ReactNode;
  /** Second paragraph — count/info line */
  detail?: ReactNode;
  buttonLabel: string;
  /** Optional icon shown after the button label */
  buttonIcon?: IconKey;
  onStart: () => void;
}

export function StepIntroScreen({
  icon,
  title,
  description,
  detail,
  buttonLabel,
  buttonIcon,
  onStart,
}: StepIntroScreenProps) {
  return (
    <div className="bg-background rounded-2xl shadow-sm p-8 text-center">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <AppIcon name={icon} className="text-primary text-3xl" aria-hidden />
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-3">{title}</h2>

      <p className={`text-lg text-muted-foreground ${detail ? "mb-2" : "mb-8"}`}>
        {description}
      </p>

      {detail && (
        <p className="text-muted-foreground mb-8">{detail}</p>
      )}

      <button
        type="button"
        onClick={onStart}
        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition text-lg"
      >
        {buttonLabel}
        {buttonIcon && <AppIcon name={buttonIcon} className="w-5 h-5" aria-hidden />}
      </button>
    </div>
  );
}
