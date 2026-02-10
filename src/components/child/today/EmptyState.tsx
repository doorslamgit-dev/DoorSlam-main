// src/components/child/today/EmptyState.tsx
// Loading and Error state components for the Today view

import AppIcon from "../../ui/AppIcon";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-neutral-600">{message}</p>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="max-w-[1120px] mx-auto px-4 py-8">
      <div className="bg-danger-bg border border-danger-border rounded-2xl p-6 text-center">
        <div className="w-12 h-12 bg-danger-bg rounded-full flex items-center justify-center mx-auto mb-4">
          <AppIcon name="triangle-alert" className="text-danger w-6 h-6" />
        </div>
        <p className="text-danger font-medium mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-red-600 transition"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

