// src/components/child/previewstep/StartButton.tsx

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

interface StartButtonProps {
  canStart: boolean;
  isStarting: boolean;
  onStart: () => void;
}

export function StartButton({ canStart, isStarting, onStart }: StartButtonProps) {
  const arrowIcon: IconKey = "arrow-right";

  return (
    <div className="bg-background rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-primary mb-1">Ready to begin?</h3>
          <p className="text-muted-foreground text-sm">
            {canStart ? "Let's start your revision session" : "Select your confidence level to continue"}
          </p>
        </div>

        <button
          type="button"
          onClick={onStart}
          disabled={!canStart || isStarting}
          className="flex items-center space-x-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isStarting ? "Starting..." : "Start Session"}</span>
          <AppIcon name={arrowIcon} className="text-primary-foreground" />
        </button>
      </div>
    </div>
  );
}
