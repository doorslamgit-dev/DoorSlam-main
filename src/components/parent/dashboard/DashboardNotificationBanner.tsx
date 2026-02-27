// src/components/parent/dashboard/DashboardNotificationBanner.tsx
// Contextual nudge banner shown when child needs attention

import AskAITutorButton from '../../ui/AskAITutorButton';
import type { ChildSummary } from '../../../types/parent/parentDashboardTypes';

interface DashboardNotificationBannerProps {
  child: ChildSummary;
}

export function DashboardNotificationBanner({ child }: DashboardNotificationBannerProps) {
  const showBanner =
    child.status_indicator === 'needs_attention' || child.status_indicator === 'keep_an_eye';

  if (!showBanner) return null;

  const message =
    child.status_detail ||
    child.insight_message ||
    'A gentle check in could help get things back on track.';

  return (
    <div className="flex items-center justify-between gap-4 bg-foreground/90 rounded-xl px-4 py-2.5 max-w-[500px]">
      <p className="text-sm text-background/80 min-w-0">{message}</p>
      <AskAITutorButton className="bg-transparent hover:bg-transparent" />
    </div>
  );
}

export default DashboardNotificationBanner;
