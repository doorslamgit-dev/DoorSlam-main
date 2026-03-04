// src/components/child/session/SectionHeader.tsx
// Shared icon + title + description header used across session steps

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

interface SectionHeaderProps {
  icon: IconKey;
  title: string;
  description?: string;
  /** Override bottom margin; defaults to "mb-5" */
  className?: string;
}

export function SectionHeader({ icon, title, description, className = "mb-5" }: SectionHeaderProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
        <AppIcon name={icon} className="w-6 h-6 text-primary" aria-hidden />
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-bold text-primary">{title}</h2>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
    </div>
  );
}
