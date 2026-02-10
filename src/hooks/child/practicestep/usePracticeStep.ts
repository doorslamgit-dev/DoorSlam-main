// src/hooks/child/practicestep/usePracticeStep.ts

import { useState, useCallback, useMemo } from "react";
import {
  PracticeQuestion,
  SelfAssessment,
  QuestionAnswer,
  DifficultyLevel,
  QuestionCounts,
} from "../../../types/child/practicestep";

interface UsePracticeStepProps {
  allQuestions: PracticeQuestion[];
  onPatch: (patch: Record<string, unknown>) => void;
  onNext: () => void;
}

export function usePracticeStep({
  allQuestions,
  onPatch,
  onNext,
}: UsePracticeStepProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>("medium");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsToShow, setQuestionsToShow] = useState(2); // Start with 2 questions
  const [answers, setAnswers] = useState<Map<string, QuestionAnswer>>(new Map());
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Count questions by difficulty
  const questionCounts = useMemo<QuestionCounts>(() => {
    const counts = { easy: 0, medium: 0, hard: 0, all: allQuestions.length };
    allQuestions.forEach((q) => {
      if (q.difficulty === 1) counts.easy++;
      else if (q.difficulty === 3) counts.hard++;
      else counts.medium++;
    });
    return counts;
  }, [allQuestions]);

  // Filter questions by selected difficulty
  const filteredQuestions = useMemo(() => {
    const hasDifficulty = allQuestions.some((q) => q.difficulty !== undefined);
    if (!hasDifficulty) return allQuestions;

    return allQuestions.filter((q) => {
      if (selectedDifficulty === "all") return true;
      if (selectedDifficulty === "easy") return q.difficulty === 1;
      if (selectedDifficulty === "hard") return q.difficulty === 3;
      return q.difficulty === 2 || q.difficulty === undefined;
    });
  }, [allQuestions, selectedDifficulty]);

  // Questions to show in current session (limited by questionsToShow)
  const activeQuestions = useMemo(() => {
    return filteredQuestions.slice(0, questionsToShow);
  }, [filteredQuestions, questionsToShow]);

  const currentQuestion = activeQuestions[currentQuestionIndex];
  const totalActiveQuestions = activeQuestions.length;
  const hasQuestions = filteredQuestions.length > 0;
  const hasMoreQuestions = filteredQuestions.length > questionsToShow;
  const remainingInSession = totalActiveQuestions - currentQuestionIndex;

  // Handlers
  const handleStart = useCallback(() => {
    setHasStarted(true);
  }, []);

  const handleSubmit = useCallback(() => {
    setIsSubmitted(true);
  }, []);

  const handleSelfAssess = useCallback(
    (assessment: SelfAssessment) => {
      if (!currentQuestion) return;

      setAnswers((prev) => {
        const newMap = new Map(prev);
        newMap.set(currentQuestion.id, {
          questionId: currentQuestion.id,
          userAnswer: currentAnswer,
          selfAssessment: assessment,
        });
        return newMap;
      });
    },
    [currentQuestion, currentAnswer]
  );

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < totalActiveQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCurrentAnswer("");
      setIsSubmitted(false);
    } else {
      setIsComplete(true);
    }
  }, [currentQuestionIndex, totalActiveQuestions]);

  const handleSkipToFinish = useCallback(() => {
    setIsComplete(true);
  }, []);

  const handleDoMore = useCallback(() => {
    // Add more questions to the session
    const newCount = Math.min(questionsToShow + 2, filteredQuestions.length);
    setQuestionsToShow(newCount);
    setIsComplete(false);
    // Continue from where we left off
    setCurrentQuestionIndex(totalActiveQuestions);
    setCurrentAnswer("");
    setIsSubmitted(false);
  }, [questionsToShow, filteredQuestions.length, totalActiveQuestions]);

  const handleContinue = useCallback(() => {
    // Save summary
    const answerArray = Array.from(answers.values());
    const summary = {
      total_questions_available: filteredQuestions.length,
      questions_attempted: answerArray.length,
      got_it_count: answerArray.filter((a) => a.selfAssessment === "got_it").length,
      not_quite_count: answerArray.filter((a) => a.selfAssessment === "not_quite").length,
      unsure_count: answerArray.filter((a) => a.selfAssessment === "unsure").length,
      answers: answerArray,
      difficulty_selected: selectedDifficulty,
      completed_at: new Date().toISOString(),
    };
    onPatch(summary);
    onNext();
  }, [answers, filteredQuestions.length, selectedDifficulty, onPatch, onNext]);

  return {
    hasQuestions,
    hasStarted,
    isComplete,
    selectedDifficulty,
    questionCounts,
    filteredQuestions,
    activeQuestions,
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
  };
}
