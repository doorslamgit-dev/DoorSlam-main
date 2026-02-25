// src/components/parent/rewards/QuickStartBanner.tsx
// FEAT-013: Quick start prompt for empty rewards state

import AppIcon from '../../ui/AppIcon';

interface QuickStartBannerProps {
  onQuickStart: () => void;
  loading?: boolean;
}

export function QuickStartBanner({ onQuickStart, loading = false }: QuickStartBannerProps) {
  return (
    <div className="bg-background rounded-xl p-4 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <AppIcon name="zap" className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">Quick Start</p>
          <p className="text-sm text-muted-foreground">
            Add "30 minutes screen time" for 150 points with auto-approve
          </p>
        </div>
      </div>
      <button
        onClick={onQuickStart}
        disabled={loading}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
      >
        {loading ? (
          <>
            <AppIcon name="loader" className="w-4 h-4 animate-spin" />
            Setting up...
          </>
        ) : (
          <>
            <AppIcon name="zap" className="w-4 h-4" />
            Quick Start
          </>
        )}
      </button>
    </div>
  );
}