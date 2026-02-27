// src/components/layout/NotificationBanner.tsx
// Generic dark notification banner — shared across all parent tab pages.

import AskAITutorButton from '../ui/AskAITutorButton';

interface NotificationBannerProps {
  message: string;
}

export function NotificationBanner({ message }: NotificationBannerProps) {
  return (
    <div className="flex items-center justify-between gap-4 bg-foreground/90 rounded-xl px-4 py-2.5 max-w-[500px]">
      <p className="text-sm text-background/80 min-w-0">{message}</p>
      <AskAITutorButton className="shrink-0 bg-transparent hover:bg-transparent" />
    </div>
  );
}

export default NotificationBanner;
