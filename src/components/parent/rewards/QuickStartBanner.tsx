// src/components/parent/rewards/QuickStartBanner.tsx
// FEAT-013: Quick start prompt for empty rewards state

import AppIcon from '../../ui/AppIcon';

interface QuickStartBannerProps {
  onQuickStart: () => void;
  loading?: boolean;
}

export function QuickStartBanner({ onQuickStart, loading = false }: QuickStartBannerProps) {
  return (
    <div className="bg-neutral-0 rounded-xl p-4 border border-primary-200 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <AppIcon name="zap" className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <p className="font-medium text-neutral-900">Quick Start</p>
          <p className="text-sm text-neutral-500">
            Add "30 minutes screen time" for 150 points with auto-approve
          </p>
        </div>
      </div>
      <button
        onClick={onQuickStart}
        disabled={loading}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
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