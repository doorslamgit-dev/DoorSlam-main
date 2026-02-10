// src/components/parentOnboarding/OnboardingModal.tsx

import type { ReactNode } from "react";
import Alert from "../ui/Alert";
import AppIcon from "../ui/AppIcon";

type OnboardingModalProps = {
  /** Title shown in header (e.g., "Add your child") */
  title: string;
  /** Current step number (1-based for display) */
  currentStep: number;
  /** Total steps (default 10) */
  totalSteps?: number;
  /** Show progress bar (false for invite/completion screens) */
  showProgress?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Content to render in modal body */
  children: ReactNode;
  /** Back button config */
  backButton?: {
    label?: string;
    disabled?: boolean;
    onClick: () => void;
  } | null;
  /** Continue button config */
  continueButton?: {
    label?: string;
    disabled?: boolean;
    loading?: boolean;
    onClick: () => void;
  } | null;
  /** Close button handler (X in header) */
  onClose?: () => void;
};

export default function OnboardingModal({
  title,
  currentStep,
  totalSteps = 10,
  showProgress = true,
  error,
  children,
  backButton,
  continueButton,
  onClose,
}: OnboardingModalProps) {
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-neutral-0 rounded-2xl shadow-card overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-neutral-800">{title}</h1>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                aria-label="Close"
              >
                <AppIcon name="x" className="w-5 h-5 text-neutral-500" aria-hidden />
              </button>
            )}
          </div>

          {/* Progress bar */}
          {showProgress && (
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-medium text-neutral-700">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-xs font-medium text-neutral-500">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <Alert variant="error" title="Something needs fixing" className="mx-8 mt-6">
            <span className="whitespace-pre-line">{error}</span>
          </Alert>
        )}

        {/* Content */}
        <div className="px-8 py-8">{children}</div>

        {/* Footer */}
        {(backButton || continueButton) && (
          <div className="px-8 py-6 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
            {backButton ? (
              <button
                type="button"
                onClick={backButton.onClick}
                disabled={backButton.disabled}
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  backButton.disabled
                    ? "text-neutral-400 bg-neutral-200 cursor-not-allowed opacity-50"
                    : "text-neutral-700 bg-neutral-200 hover:bg-neutral-300"
                }`}
              >
                {backButton.label ?? "Back"}
              </button>
            ) : (
              <div />
            )}

            {continueButton && (
              <button
                type="button"
                onClick={continueButton.onClick}
                disabled={continueButton.disabled || continueButton.loading}
                className="px-8 py-3 rounded-full font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {continueButton.loading ? (
                  <span className="flex items-center gap-2">
                    <AppIcon name="spinner" className="w-4 h-4 animate-spin" aria-hidden />
                    {continueButton.label ?? "Continue"}
                  </span>
                ) : (
                  continueButton.label ?? "Continue"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
