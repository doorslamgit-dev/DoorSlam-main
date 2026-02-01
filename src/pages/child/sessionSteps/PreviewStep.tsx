// src/pages/child/sessionSteps/PreviewStep.tsx
// NEW: 6-Step Session Model - January 2026
// Step 1: Pre-confidence capture + session overview
// FEAT-008: Social media toggle for focus mode
// REFACTORED: January 2026 - Modular structure with extracted components

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGaugeHigh } from "@fortawesome/free-solid-svg-icons";
import { PreviewStepProps } from "../../../types/child/previewstep";
import { usePreviewStep } from "../../../hooks/child/previewstep";
import { getIconFromName } from "../../../services/child/previewstep";
import {
  ConfidenceSelector,
  FocusModeToggle,
  TopicHeader,
  StartButton,
} from "../../../components/child/previewstep";

export default function PreviewStep({
  overview,
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

  const subjectIcon = getIconFromName(overview.subject_icon);
  const subjectColor = overview.subject_color || "#5B2CFF";
  const sessionMinutes = overview.session_duration_minutes ?? 20;

  const isBusy = saving || state.isStarting;

  return (
    <div className="space-y-6">
      {/* Topic Header Section */}
      <section className="mb-6">
        <TopicHeader
          subjectName={overview.subject_name}
          topicName={overview.topic_name}
          subjectIcon={subjectIcon}
          subjectColor={subjectColor}
          sessionMinutes={sessionMinutes}
          totalSteps={overview.total_steps}
        />
      </section>

      {/* Focus Mode Section */}
      <section className="mb-6">
        <div className="bg-white rounded-2xl shadow-card p-6">
          <FocusModeToggle
            isActive={state.socialMediaOff}
            onToggle={handlers.handleSocialMediaToggle}
            disabled={isBusy}
          />
        </div>
      </section>

      {/* Pre-Confidence Section */}
      <section className="mb-6">
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <FontAwesomeIcon icon={faGaugeHigh} className="text-primary-600 text-xl" />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-primary-900">
                How confident are you with this topic?
              </h2>
              <p className="text-neutral-500 text-sm">
                This helps us tailor the session to your needs
              </p>
            </div>
          </div>

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
          className="text-neutral-500 hover:text-neutral-700 text-sm font-medium transition"
        >
          Not ready? Go back to dashboard
        </button>
      </section>
    </div>
  );
}