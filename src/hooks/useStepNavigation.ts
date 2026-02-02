/**
 * useStepNavigation - Multi-step wizard navigation hook
 *
 * A comprehensive hook for managing multi-step flows like onboarding wizards,
 * modals, and form sequences. Provides navigation controls, validation,
 * progress tracking, and error handling.
 *
 * Features:
 * - Step-by-step navigation with validation
 * - Progress percentage calculation
 * - Error state management
 * - Computed canNext/canBack values
 * - Optional completion callback
 * - Direct step navigation with goToStep
 *
 * @example
 * ```tsx
 * function OnboardingWizard() {
 *   const {
 *     currentStep,
 *     progress,
 *     error,
 *     canNext,
 *     canBack,
 *     handleNext,
 *     handleBack,
 *     goToStep,
 *     reset,
 *   } = useStepNavigation({
 *     totalSteps: 3,
 *     validations: {
 *       0: () => email !== '',
 *       1: () => password.length >= 8,
 *       2: () => agreedToTerms,
 *     },
 *     onComplete: async () => {
 *       await submitForm();
 *     },
 *   });
 *
 *   return (
 *     <div>
 *       <progress value={progress} max={100} />
 *       {currentStep === 0 && <EmailStep />}
 *       {currentStep === 1 && <PasswordStep />}
 *       {currentStep === 2 && <TermsStep />}
 *       {error && <div>{error}</div>}
 *       <button disabled={!canBack} onClick={handleBack}>Back</button>
 *       <button disabled={!canNext} onClick={handleNext}>Next</button>
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useCallback, useMemo } from 'react';

/**
 * Validation function for a specific step
 * Returns true if step is valid, false otherwise
 */
export type StepValidation = () => boolean;

/**
 * Configuration for step navigation
 */
export interface UseStepNavigationConfig {
  /** Total number of steps in the flow */
  totalSteps: number;
  /** Optional validation functions for each step (0-indexed) */
  validations?: Record<number, StepValidation>;
  /** Optional callback when user completes final step */
  onComplete?: () => void | Promise<void>;
  /** Initial step (default: 0) */
  initialStep?: number;
}

/**
 * Result interface returned by useStepNavigation hook
 */
export interface UseStepNavigationResult {
  /** Current step index (0-indexed) */
  currentStep: number;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current error message, if any */
  error: string | null;
  /** Whether user can proceed to next step */
  canNext: boolean;
  /** Whether user can go back to previous step */
  canBack: boolean;
  /** Whether currently processing (e.g., onComplete is running) */
  isProcessing: boolean;
  /** Navigate to next step */
  handleNext: () => Promise<void>;
  /** Navigate to previous step */
  handleBack: () => void;
  /** Navigate directly to a specific step */
  goToStep: (step: number) => void;
  /** Reset to initial step */
  reset: () => void;
  /** Manually set error message */
  setError: (error: string | null) => void;
}

/**
 * Multi-step wizard navigation hook
 *
 * @param config - Navigation configuration
 * @returns Step navigation utilities
 */
export function useStepNavigation(
  config: UseStepNavigationConfig
): UseStepNavigationResult {
  const {
    totalSteps,
    validations = {},
    onComplete,
    initialStep = 0,
  } = config;

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Calculate progress percentage
   */
  const progress = useMemo(() => {
    return Math.round(((currentStep + 1) / totalSteps) * 100);
  }, [currentStep, totalSteps]);

  /**
   * Check if current step is valid
   */
  const isCurrentStepValid = useCallback(() => {
    const validator = validations[currentStep];
    return validator ? validator() : true;
  }, [currentStep, validations]);

  /**
   * Whether user can proceed to next step
   */
  const canNext = useMemo(() => {
    if (isProcessing) return false;
    if (currentStep >= totalSteps - 1) return false;
    return isCurrentStepValid();
  }, [currentStep, totalSteps, isCurrentStepValid, isProcessing]);

  /**
   * Whether user can go back to previous step
   */
  const canBack = useMemo(() => {
    if (isProcessing) return false;
    return currentStep > 0;
  }, [currentStep, isProcessing]);

  /**
   * Navigate to next step or complete flow
   */
  const handleNext = useCallback(async () => {
    // Clear any previous errors
    setError(null);

    // Validate current step
    if (!isCurrentStepValid()) {
      setError('Please complete all required fields before continuing.');
      return;
    }

    // If this is the last step, trigger onComplete
    if (currentStep === totalSteps - 1) {
      if (onComplete) {
        setIsProcessing(true);
        try {
          await onComplete();
        } catch (err) {
          const message = err instanceof Error ? err.message : 'An error occurred';
          setError(message);
        } finally {
          setIsProcessing(false);
        }
      }
      return;
    }

    // Move to next step
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [currentStep, totalSteps, isCurrentStepValid, onComplete]);

  /**
   * Navigate to previous step
   */
  const handleBack = useCallback(() => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  /**
   * Navigate directly to a specific step
   */
  const goToStep = useCallback(
    (step: number) => {
      setError(null);
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps]
  );

  /**
   * Reset to initial step
   */
  const reset = useCallback(() => {
    setCurrentStep(initialStep);
    setError(null);
    setIsProcessing(false);
  }, [initialStep]);

  return {
    currentStep,
    progress,
    error,
    canNext,
    canBack,
    isProcessing,
    handleNext,
    handleBack,
    goToStep,
    reset,
    setError,
  };
}
