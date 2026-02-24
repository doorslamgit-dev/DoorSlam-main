// src/components/parent/dashboard/DashboardNotificationBanner.tsx
// Contextual nudge banner shown when child needs attention

import AppIcon from '../../ui/AppIcon';
import type { ChildSummary } from '../../../types/parent/parentDashboardTypes';

interface DashboardNotificationBannerProps {
  child: ChildSummary;
}

export function DashboardNotificationBanner({ child }: DashboardNotificationBannerProps) {
  const showBanner =
    child.status_indicator === 'needs_attention' || child.status_indicator === 'keep_an_eye';

  if (!showBanner) return null;

  const message = child.status_detail || child.insight_message || 'A gentle check in could help get things back on track.';

  return (
    <div className="flex items-center justify-between gap-4 bg-neutral-800 rounded-xl px-4 py-2.5 mb-4">
      <p className="text-sm text-neutral-300 min-w-0">{message}</p>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0">
        <AppIcon name="bot" className="w-3.5 h-3.5" />
        Ask AI Tutor
      </button>
    </div>
  );
}

export default DashboardNotificationBanner;
