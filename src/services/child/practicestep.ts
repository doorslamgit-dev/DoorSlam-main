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
    color: "bg-green-100 text-green-700 border-green-300",
    emoji: "🌱",
  },
  {
    value: "medium",
    label: "Medium",
    color: "bg-amber-100 text-amber-700 border-amber-300",
    emoji: "⭐",
  },
  {
    value: "hard",
    label: "Hard",
    color: "bg-red-100 text-red-700 border-red-300",
    emoji: "🔥",
  },
];

export function getDifficultyLabel(difficulty?: number): string {
  if (difficulty === 1) return "Easy";
  if (difficulty === 3) return "Hard";
  return "Medium";
}

export function getDifficultyColor(difficulty?: number): string {
  if (difficulty === 1) return "bg-green-100 text-green-700";
  if (difficulty === 3) return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
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
