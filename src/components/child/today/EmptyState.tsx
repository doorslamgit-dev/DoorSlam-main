// src/components/child/today/EmptyState.tsx
// Loading, Error, and Empty state components

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
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AppIcon name="triangle-alert" className="text-red-500 w-6 h-6" />
        </div>
        <p className="text-red-700 font-medium mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export default function EmptyState({
  title = "No sessions today",
  message = "Enjoy your break! Check back tomorrow for your next sessions.",
}: EmptyStateProps) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AppIcon name="book" className="text-primary-600 w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-primary-900 mb-2">{title}</h3>
      <p className="text-neutral-600">{message}</p>
    </div>
  );
}