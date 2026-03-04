// src/views/child/sessionSteps/PreviewStep.tsx
// NEW: 6-Step Session Model - January 2026
// Step 1: Pre-confidence capture + session overview
// FEAT-008: Social media toggle for focus mode
// REFACTORED: January 2026 - Modular structure with extracted components

import { PreviewStepProps } from "../../../types/child/previewstep";
import { usePreviewStep } from "../../../hooks/child/previewstep";
import {
  ConfidenceSelector,
  FocusModeToggle,
  StartButton,
} from "../../../components/child/previewstep";
import { SectionHeader } from "../../../components/child/session";

export default function PreviewStep({
  overview: _overview,
  payload,
  saving,
  onPatch,
  onNext,
  onExit,
}: PreviewStepProps) {
  const { state, derived, handlers } = usePreviewStep({
    initialPayload: payload?.preview,
    onPatch,
    onNext,
  });

  const isBusy = saving || state.isStarting;

  return (
    <div className="space-y-6">
      {/* Focus Mode Section */}
      <section className="mb-6">
        <div className="bg-background rounded-2xl shadow-sm p-6">
          <FocusModeToggle
            isActive={state.socialMediaOff}
            onToggle={handlers.handleSocialMediaToggle}
            disabled={isBusy}
          />
        </div>
      </section>

      {/* Pre-Confidence Section */}
      <section className="mb-6">
        <div className="bg-background rounded-2xl shadow-sm p-6">
          <SectionHeader
            icon="gauge"
            title="How confident are you with this topic?"
            description="This helps us tailor the session to your needs"
            className="mb-6"
          />

          <ConfidenceSelector
            selected={state.preConfidence}
            onSelect={handlers.handleConfidenceSelect}
            disabled={isBusy}
          />
        </div>
      </section>

      {/* Start Button Section */}
      <section className="mb-6">
        <StartButton
          canStart={derived.canStart}
          isStarting={state.isStarting}
          onStart={handlers.handleStart}
        />
      </section>

      {/* Exit Option */}
      <section className="text-center">
        <button
          type="button"
          onClick={onExit}
          className="text-muted-foreground hover:text-foreground text-sm font-medium transition"
        >
          Not ready? Go back to dashboard
        </button>
      </section>
    </div>
  );
}