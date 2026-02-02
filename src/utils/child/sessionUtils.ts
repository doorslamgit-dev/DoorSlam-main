// src/utils/child/sessionUtils.ts
// Utility functions for session runner

import { getSubjectIcon } from "../../constants/icons";

export { getSubjectIcon };

export function calculateTimeRemaining(
  currentStepIndex: number,
  totalSteps: number,
  sessionDurationMinutes: number
): number {
  const stepsRemaining = totalSteps - currentStepIndex + 1;
  const timePerStep = Math.ceil(sessionDurationMinutes / totalSteps);
  return stepsRemaining * timePerStep;
}