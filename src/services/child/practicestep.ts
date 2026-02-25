// src/services/child/practicestep.ts

import { DifficultyLevel } from "../../types/child/practicestep";

export const DIFFICULTY_OPTIONS: Array<{
  value: DifficultyLevel;
  label: string;
  color: string;
  icon: string;
}> = [
  {
    value: "easy",
    label: "Easy",
    color: "bg-success/10 text-success border-success-border",
    icon: "sprout",
  },
  {
    value: "medium",
    label: "Medium",
    color: "bg-warning/10 text-warning border-warning-border",
    icon: "star",
  },
  {
    value: "hard",
    label: "Hard",
    color: "bg-destructive/10 text-destructive border-danger",
    icon: "flame",
  },
];

export function getDifficultyLabel(difficulty?: number): string {
  if (difficulty === 1) return "Easy";
  if (difficulty === 3) return "Hard";
  return "Medium";
}

export function getDifficultyColor(difficulty?: number): string {
  if (difficulty === 1) return "bg-success/10 text-success";
  if (difficulty === 3) return "bg-destructive/10 text-destructive";
  return "bg-warning/10 text-warning";
}

export function getEncouragementMessage(
  gotItCount: number,
  notQuiteCount: number,
  unsureCount: number,
  questionsAttempted: number
): { message: string; icon: string } {
  if (gotItCount === questionsAttempted && questionsAttempted > 0) {
    return {
      message: "Perfect! You nailed every question!",
      icon: "sparkles",
    };
  }

  if (gotItCount > notQuiteCount + unsureCount) {
    return {
      message: "Great work! You're getting the hang of this!",
      icon: "dumbbell",
    };
  }

  if (gotItCount > 0) {
    return {
      message: "Good effort! Keep practising and you'll get there!",
      icon: "check-circle",
    };
  }

  if (questionsAttempted > 0) {
    return {
      message: "Practice makes perfect! Every attempt helps you learn.",
      icon: "target",
    };
  }

  return {
    message: "Ready when you are!",
    icon: "target",
  };
}
