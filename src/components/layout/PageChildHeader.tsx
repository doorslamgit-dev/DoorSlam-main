// src/components/layout/PageChildHeader.tsx
// Shared page header: title + subtitle (left) + optional notification banner (right).
// Mirrors the DashboardChildHeader layout for consistent styling across all parent tabs.

import type { ReactNode } from 'react';

interface PageChildHeaderProps {
  title: string;
  subtitle?: string;
  banner?: ReactNode;
}

export function PageChildHeader({ title, subtitle, banner }: PageChildHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-4">
      {/* Left: Page title + subtitle */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      {/* Right: Notification banner fills remaining space */}
      {banner && (
        <div className="flex-1 min-w-0 flex md:justify-end">{banner}</div>
      )}
    </div>
  );
}

export default PageChildHeader;
