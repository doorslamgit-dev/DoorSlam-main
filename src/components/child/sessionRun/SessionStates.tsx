// src/components/child/sessionRun/SessionStates.tsx
// Loading and Error state components for session runner

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

const ICON_SPINNER: IconKey = "spinner";
const ICON_WARNING: IconKey = "warningTriangle";

export function LoadingState() {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center">
      <div className="text-center">
        <div className="text-primary text-4xl mb-4 animate-spin" aria-hidden="true">
          <AppIcon name={ICON_SPINNER} />
        </div>
        <p className="text-muted-foreground font-medium">Loading session...</p>
      </div>
    </div>
  );
}

type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center">
      <div className="bg-background rounded-2xl shadow-soft p-8 max-w-md text-center">
        <div className="text-destructive text-4xl mb-4" aria-hidden="true">
          <AppIcon name={ICON_WARNING} />
        </div>

        <h2 className="text-xl font-bold text-foreground mb-2">
          Something went wrong
        </h2>

        <p className="text-muted-foreground mb-6">{message}</p>

        <button
          type="button"
          onClick={onRetry}
          className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
