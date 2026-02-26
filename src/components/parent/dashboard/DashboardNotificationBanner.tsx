// src/components/parent/dashboard/DashboardNotificationBanner.tsx
// Contextual nudge banner shown when child needs attention

import Button from '../../ui/Button';
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
      <Button variant="outline" size="sm" leftIcon="sparkles" className="bg-transparent text-primary border-primary/30 hover:bg-transparent [&_svg]:text-lime">
        ASK AI TUTOR
      </Button>
    </div>
  );
}

export default DashboardNotificationBanner;
