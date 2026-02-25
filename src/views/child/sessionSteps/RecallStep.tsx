// src/views/child/sessionSteps/RecallStep.tsx
// REFACTORED: January 2026 - Flashcard-based recall with flip animation
// Child-friendly language throughout
// Now uses extracted components, hooks, services, and types

import AppIcon from "../../../components/ui/AppIcon";

// Types
import type { RecallStepProps, Flashcard } from "../../../types/child/recallStep";

// Hooks
import { useRecallStep } from "../../../hooks/child/recallStep";

// Components
import {
  FlashcardViewer,
  IntroScreen,
  CompleteScreen,
  ProgressHeader,
  RatingButtons,
} from "../../../components/child/recallStep";

// =============================================================================
// No Cards Fallback Component
// =============================================================================

function NoCardsScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="bg-background rounded-2xl shadow-sm p-8 text-center">
      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
        <AppIcon name="circle-help" className="text-muted-foreground w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">Let's skip ahead!</h2>
      <p className="text-muted-foreground mb-6">
        We don't have any warm-up questions for this topic yet. Let's jump straight in!
      </p>
      <button
        type="button"
        onClick={onNext}
        className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition"
      >
        Continue
      </button>
    </div>
  );
}

// =============================================================================
// Footer Controls Component
// =============================================================================

function FooterControls({ onShuffle }: { onShuffle: () => void }) {
  return (
    <div className="flex items-center justify-end text-sm">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onShuffle}
          className="text-muted-foreground hover:text-foreground"
          title="Shuffle"
        >
          <AppIcon name="shuffle" className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1"
          title="Full screen"
        >
          <AppIcon name="expand" className="w-4 h-4" />
          <span>Full screen</span>
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Main RecallStep Component
// =============================================================================

export default function RecallStep({
  overview,
  payload,
  saving,
  onPatch,
  onNext,
  onUpdateFlashcardProgress,
}: RecallStepProps) {
  // Extract cards from payload
  const cards: Flashcard[] = payload?.recall?.cards ?? [];

  // Use custom hook for state management
  const {
    hasStarted,
    currentIndex,
    isFlipped,
    isComplete,
    currentCard,
    learningCount,
    knownCount,
    totalCards,
    hasCards,
    canUndo,
    handleStart,
    handleFlip,
    handleRate,
    handleUndo,
    handleShuffle,
    handleContinue,
  } = useRecallStep({
    cards,
    onPatch,
    onNext,
    onUpdateFlashcardProgress,
  });

  // ==========================================================================
  // Render: No cards fallback
  // ==========================================================================
  if (!hasCards) {
    return <NoCardsScreen onNext={onNext} />;
  }

  // ==========================================================================
  // Render: Intro screen (before starting)
  // ==========================================================================
  if (!hasStarted) {
    return (
      <IntroScreen
        childName={overview.child_name}
        topicName={overview.topic_name}
        totalCards={totalCards}
        onStart={handleStart}
      />
    );
  }

  // ==========================================================================
  // Render: Complete state
  // ==========================================================================
  if (isComplete) {
    return (
      <CompleteScreen
        knownCount={knownCount}
        learningCount={learningCount}
        totalCards={totalCards}
        saving={saving}
        onContinue={handleContinue}
      />
    );
  }

  // ==========================================================================
  // Render: Active flashcard review
  // ==========================================================================
  return (
    <div className="space-y-6">
      {/* Progress header */}
      <ProgressHeader
        learningCount={learningCount}
        knownCount={knownCount}
        currentIndex={currentIndex}
        totalCards={totalCards}
      />

      {/* Flashcard */}
      {currentCard && (
        <FlashcardViewer
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={handleFlip}
          topicName={overview.topic_name}
        />
      )}

      {/* Rating buttons - only show when flipped */}
      {isFlipped && (
        <RatingButtons
          onRate={handleRate}
          onUndo={handleUndo}
          canUndo={canUndo}
          saving={saving}
        />
      )}

      {/* Footer controls */}
      <FooterControls onShuffle={handleShuffle} />
    </div>
  );
}