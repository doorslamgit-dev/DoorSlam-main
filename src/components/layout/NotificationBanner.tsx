// src/components/layout/NotificationBanner.tsx
// Unified notification banner — used across all parent pages.
// Variant maps to design-system alert tokens (warning, error, success, info).

import AskAITutorButton from '../ui/AskAITutorButton';
import AppIcon from '../ui/AppIcon';
import type { AlertVariant } from '../ui/Alert';

const variantIcons: Record<AlertVariant, string> = {
  warning: 'triangle-alert',
  error: 'triangle-alert',
  success: 'check-circle',
  info: 'info',
};

const variantStyles: Record<AlertVariant, string> = {
  warning: 'bg-warning/10 border-warning/30',
  error: 'bg-destructive/10 border-destructive/30',
  success: 'bg-success/10 border-success/30',
  info: 'bg-info/10 border-info/30',
};

const variantIconColor: Record<AlertVariant, string> = {
  warning: 'text-warning',
  error: 'text-destructive',
  success: 'text-success',
  info: 'text-info',
};

interface NotificationBannerProps {
  message: string;
  variant?: AlertVariant;
  showAITutor?: boolean;
}

export function NotificationBanner({
  message,
  variant = 'warning',
  showAITutor = true,
}: NotificationBannerProps) {
  return (
    <div
      className={`flex items-center gap-3 border rounded-xl px-4 py-2.5 max-w-[500px] ${variantStyles[variant]}`}
    >
      <AppIcon
        name={variantIcons[variant]}
        className={`w-4 h-4 shrink-0 ${variantIconColor[variant]}`}
      />
      <p className="text-sm text-foreground min-w-0 flex-1">{message}</p>
      {showAITutor && <AskAITutorButton className="shrink-0" />}
    </div>
  );
}

export default NotificationBanner;
