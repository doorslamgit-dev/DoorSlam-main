// src/views/child/sessionSteps/ReinforceStep.tsx
// UPDATED: January 2026 - Teaching slides + worked examples
// Child-friendly language throughout
// REFACTORED: January 2026 - Modular structure with extracted components

import type { ReinforceStepProps, TeachingSlide, WorkedExample } from "../../../types/child/reinforcestep";
import { useReinforceStep } from "../../../hooks/child/reinforcestep";
import {
  IntroScreen,
  TeachingSlideCard,
  WorkedExampleCard,
  CompleteScreen,
  NoContentScreen,
} from "../../../components/child/reinforcestep";

export default function ReinforceStep({
  overview,
  payload,
  saving,
  onPatch,
  onNext,
}: ReinforceStepProps) {
  // Extract content from payload
  const slides: TeachingSlide[] = payload?.reinforce?.slides ?? [];
  const workedExamples: WorkedExample[] = payload?.reinforce?.worked_examples ?? [];

  // Use custom hook for state management
  const {
    hasContent,
    hasStarted,
    inSlidesPhase,
    inExamplesPhase,
    isComplete,
    currentSlide,
    currentSlideIndex,
    totalSlides,
    currentExample,
    currentExampleIndex,
    totalExamples,
    handleStart,
    handleSlideNext,
    handleSlidePrevious,
    handleExampleNext,
    handleExamplePrevious,
    handleContinue,
  } = useReinforceStep({
    slides,
    workedExamples,
    onPatch,
    onNext,
  });

  // ==========================================================================
  // Render: No content fallback
  // ==========================================================================
  if (!hasContent) {
    return <NoContentScreen onNext={onNext} />;
  }

  // ==========================================================================
  // Render: Intro screen
  // ==========================================================================
  if (!hasStarted) {
    return (
      <IntroScreen
        topicName={overview.topic_name}
        slideCount={totalSlides}
        exampleCount={totalExamples}
        onStart={handleStart}
      />
    );
  }

  // ==========================================================================
  // Render: Slides phase
  // ==========================================================================
  if (inSlidesPhase && currentSlide) {
    return (
      <TeachingSlideCard
        slide={currentSlide}
        currentIndex={currentSlideIndex}
        totalSlides={totalSlides}
        onPrevious={handleSlidePrevious}
        onNext={handleSlideNext}
        isLastSlide={currentSlideIndex === totalSlides - 1 && totalExamples === 0}
      />
    );
  }

  // ==========================================================================
  // Render: Worked examples phase
  // ==========================================================================
  if (inExamplesPhase && currentExample) {
    return (
      <WorkedExampleCard
        example={currentExample}
        currentIndex={currentExampleIndex}
        totalExamples={totalExamples}
        onPrevious={handleExamplePrevious}
        onNext={handleExampleNext}
        isLastExample={currentExampleIndex === totalExamples - 1}
      />
    );
  }

  // ==========================================================================
  // Render: Complete screen
  // ==========================================================================
  if (isComplete) {
    return (
      <CompleteScreen
        slideCount={totalSlides}
        exampleCount={totalExamples}
        onContinue={handleContinue}
        saving={saving}
      />
    );
  }

  // Fallback (should not reach)
  return null;
}
