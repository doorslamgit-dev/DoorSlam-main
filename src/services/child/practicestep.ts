// src/services/child/practicestep.ts

import { DifficultyLevel } from "../../types/child/practicestep";

export const DIFFICULTY_OPTIONS: Array<{
  value: DifficultyLevel;
  label: string;
  color: string;
  emoji: string;
}> = [
  {
    value: "easy",
    label: "Easy",
    color: "bg-success-bg text-success border-success-border",
    emoji: "🌱",
  },
  {
    value: "medium",
    label: "Medium",
    color: "bg-warning-bg text-warning border-warning-border",
    emoji: "⭐",
  },
  {
    value: "hard",
    label: "Hard",
    color: "bg-danger-bg text-danger border-danger",
    emoji: "🔥",
  },
];

export function getDifficultyLabel(difficulty?: number): string {
  if (difficulty === 1) return "Easy";
  if (difficulty === 3) return "Hard";
  return "Medium";
}

export function getDifficultyColor(difficulty?: number): string {
  if (difficulty === 1) return "bg-success-bg text-success";
  if (difficulty === 3) return "bg-danger-bg text-danger";
  return "bg-warning-bg text-warning";
}

export function getEncouragementMessage(
  gotItCount: number,
  notQuiteCount: number,
  unsureCount: number,
  questionsAttempted: number
): { message: string; emoji: string } {
  if (gotItCount === questionsAttempted && questionsAttempted > 0) {
    return {
      message: "Perfect! You nailed every question!",
      emoji: "🌟",
    };
  }

  if (gotItCount > notQuiteCount + unsureCount) {
    return {
      message: "Great work! You're getting the hang of this!",
      emoji: "💪",
    };
  }

  if (gotItCount > 0) {
    return {
      message: "Good effort! Keep practising and you'll get there!",
      emoji: "👍",
    };
  }

  if (questionsAttempted > 0) {
    return {
      message: "Practice makes perfect! Every attempt helps you learn.",
      emoji: "🎯",
    };
  }

  return {
    message: "Ready when you are!",
    emoji: "🎯",
  };
}
