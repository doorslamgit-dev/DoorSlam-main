// src/components/parent/dashboard/DashboardMessageBanner.tsx
// Dashboard message banner — contextual nudges, alerts, achievements, reminders.
// Placeholder component — will consume dedicated hooks/services in future.

import AppIcon from '../../ui/AppIcon';
import Button from '../../ui/Button';
import type { IconKey } from '../../ui/AppIcon';

export type BannerVariant = 'nudge' | 'alert' | 'achievement' | 'reminder';

export interface BannerMessage {
  variant: BannerVariant;
  icon: IconKey;
  title: string;
  detail?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
}

interface DashboardMessageBannerProps {
  message: BannerMessage | null;
}

const VARIANT_STYLES: Record<BannerVariant, { bg: string; iconColor: string }> = {
  nudge: { bg: 'bg-foreground', iconColor: 'text-warning' },
  alert: { bg: 'bg-destructive/10', iconColor: 'text-destructive' },
  achievement: { bg: 'bg-primary', iconColor: 'text-warning' },
  reminder: { bg: 'bg-foreground', iconColor: 'text-primary/60' },
};

export function DashboardMessageBanner({ message }: DashboardMessageBannerProps) {
  if (!message) return null;

  const style = VARIANT_STYLES[message.variant];

  return (
    <div className={`${style.bg} rounded-xl px-4 py-3 flex items-center gap-3 max-w-md`}>
      <div className="flex-shrink-0">
        <AppIcon name={message.icon} className={`w-5 h-5 ${style.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-background leading-tight">
          {message.title}
        </p>
        {message.detail && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
            {message.detail}
          </p>
        )}
      </div>
      {message.ctaLabel && message.onCtaClick && (
        <Button variant="secondary" size="sm" onClick={message.onCtaClick}>
          {message.ctaLabel}
        </Button>
      )}
    </div>
  );
}

export default DashboardMessageBanner;
