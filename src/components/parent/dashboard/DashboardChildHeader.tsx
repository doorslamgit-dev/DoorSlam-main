// src/components/parent/dashboard/DashboardChildHeader.tsx
// Page header: "Dashboard" title + subtitle + inline notification banner


import type { ChildSummary } from '../../../types/parent/parentDashboardTypes';

interface DashboardChildHeaderProps {
  child: ChildSummary | null;
  banner?: React.ReactNode;
}

export function DashboardChildHeader({
  child,
  banner,
}: DashboardChildHeaderProps) {
  if (!child) return null;

  const displayName = child.preferred_name || child.first_name || child.child_name;
  const subtitle = child.insight_message || `${displayName} is getting started with revision sessions`;

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-4">
      {/* Left: Page title + subtitle */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      </div>

      {/* Right: Notification banner fills remaining space */}
      {banner && <div className="flex-1 min-w-0 flex md:justify-end">{banner}</div>}
    </div>
  );
}

export default DashboardChildHeader;
