// src/views/child/sessionSteps/PracticeStep.tsx
// UPDATED: January 2026 - Practice questions with difficulty selector
// Includes Smart Mark AI button (UI only - functionality coming later)
// V2: Clearer post-submission flow, "do more" option
// REFACTORED: January 2026 - Modular structure with extracted components

import type {
  PracticeStepProps,
  PracticeQuestion,
} from "../../../types/child/practicestep";
import { usePracticeStep } from "../../../hooks/child/practicestep";
import {
  IntroScreen,
  DifficultySelector,
  QuestionCard,
  CompleteScreen,
  NoQuestionsScreen,
} from "../../../components/child/practicestep";

export default function PracticeStep({
  overview,
  payload,
  saving,
  onPatch,
  onNext,
}: PracticeStepProps) {
  // Extract questions from payload
  const allQuestions: PracticeQuestion[] = payload?.practice?.questions ?? [];

  // Use custom hook for state management
  const {
    hasQuestions,
    hasStarted,
    isComplete,
    selectedDifficulty,
    questionCounts,
    filteredQuestions,
    currentQuestion,
    currentQuestionIndex,
    totalActiveQuestions,
    hasMoreQuestions,
    remainingInSession,
    answers,
    currentAnswer,
    isSubmitted,
    setSelectedDifficulty,
    setCurrentAnswer,
    handleStart,
    handleSubmit,
    handleSelfAssess,
    handleNextQuestion,
    handleSkipToFinish,
    handleDoMore,
    handleContinue,
  } = usePracticeStep({
    allQuestions,
    onPatch,
    onNext,
  });

  // ==========================================================================
  // Render: No questions fallback
  // ==========================================================================
  if (!hasQuestions) {
    return <NoQuestionsScreen onNext={onNext} />;
  }

  // ==========================================================================
  // Render: Intro screen
  // ==========================================================================
  if (!hasStarted) {
    return (
      <IntroScreen
        topicName={overview.topic_name}
        totalQuestions={filteredQuestions.length}
        onStart={handleStart}
      />
    );
  }

  // ==========================================================================
  // Render: Complete screen
  // ==========================================================================
  if (isComplete) {
    return (
      <CompleteScreen
        answers={Array.from(answers.values())}
        totalQuestions={filteredQuestions.length}
        questionsAttempted={answers.size}
        hasMoreQuestions={hasMoreQuestions || filteredQuestions.length > answers.size}
        onDoMore={handleDoMore}
        onContinue={handleContinue}
        saving={saving}
      />
    );
  }

  // ==========================================================================
  // Render: Active practice
  // ==========================================================================
  const currentAnswerRecord = currentQuestion ? answers.get(currentQuestion.id) : undefined;

  return (
    <div className="space-y-6">
      {/* Difficulty selector - only show at start */}
      {allQuestions.some((q) => q.difficulty !== undefined) &&
        currentQuestionIndex === 0 &&
        !isSubmitted && (
          <DifficultySelector
            selected={selectedDifficulty}
            onChange={setSelectedDifficulty}
            questionCounts={questionCounts}
          />
        )}

      {/* Question card */}
      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={totalActiveQuestions}
          userAnswer={currentAnswer}
          onAnswerChange={setCurrentAnswer}
          isSubmitted={isSubmitted}
          onSubmit={handleSubmit}
          selfAssessment={currentAnswerRecord?.selfAssessment ?? null}
          onSelfAssess={handleSelfAssess}
          onNext={handleNextQuestion}
          isLastQuestion={currentQuestionIndex === totalActiveQuestions - 1}
          onSkipToFinish={handleSkipToFinish}
          remainingQuestions={remainingInSession}
        />
      )}
    </div>
  );
}
