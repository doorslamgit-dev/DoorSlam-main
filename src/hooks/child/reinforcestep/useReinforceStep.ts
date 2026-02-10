// src/hooks/child/reinforcestep/useReinforceStep.ts

import { useState, useCallback } from "react";
import { TeachingSlide, WorkedExample } from "../../../types/child/reinforcestep";

interface UseReinforceStepProps {
  slides: TeachingSlide[];
  workedExamples: WorkedExample[];
  onPatch: (patch: Record<string, unknown>) => void;
  onNext: () => void;
}

export function useReinforceStep({
  slides,
  workedExamples,
  onPatch,
  onNext,
}: UseReinforceStepProps) {
  const totalSlides = slides.length;
  const totalExamples = workedExamples.length;
  const hasContent = totalSlides > 0 || totalExamples > 0;

  const [hasStarted, setHasStarted] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slidesComplete, setSlidesComplete] = useState(false);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [examplesComplete, setExamplesComplete] = useState(false);

  // Determine current phase
  const inSlidesPhase = hasStarted && !slidesComplete && totalSlides > 0;
  const inExamplesPhase = hasStarted && slidesComplete && !examplesComplete && totalExamples > 0;
  const isComplete = hasStarted && (slidesComplete || totalSlides === 0) && (examplesComplete || totalExamples === 0);

  const currentSlide = inSlidesPhase ? slides[currentSlideIndex] : null;
  const currentExample = inExamplesPhase ? workedExamples[currentExampleIndex] : null;

  // Handlers
  const handleStart = useCallback(() => {
    setHasStarted(true);
    // If no slides, skip to examples or complete
    if (totalSlides === 0) {
      setSlidesComplete(true);
      if (totalExamples === 0) {
        setExamplesComplete(true);
      }
    }
  }, [totalSlides, totalExamples]);

  const handleSlideNext = useCallback(() => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else {
      setSlidesComplete(true);
      if (totalExamples === 0) {
        setExamplesComplete(true);
      }
    }
  }, [currentSlideIndex, totalSlides, totalExamples]);

  const handleSlidePrevious = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  }, [currentSlideIndex]);

  const handleExampleNext = useCallback(() => {
    if (currentExampleIndex < totalExamples - 1) {
      setCurrentExampleIndex((prev) => prev + 1);
    } else {
      setExamplesComplete(true);
    }
  }, [currentExampleIndex, totalExamples]);

  const handleExamplePrevious = useCallback(() => {
    if (currentExampleIndex > 0) {
      setCurrentExampleIndex((prev) => prev - 1);
    } else if (totalSlides > 0) {
      // Go back to slides
      setSlidesComplete(false);
      setCurrentSlideIndex(totalSlides - 1);
    }
  }, [currentExampleIndex, totalSlides]);

  const handleContinue = useCallback(() => {
    // Save summary
    const summary = {
      slides_viewed: totalSlides,
      examples_viewed: totalExamples,
      completed_at: new Date().toISOString(),
    };
    onPatch(summary);
    onNext();
  }, [totalSlides, totalExamples, onPatch, onNext]);

  return {
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
  };
}
