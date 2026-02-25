// src/components/parent/dashboard/DashboardChildHeader.tsx
// Page header: "Dashboard" title + selected child info + child selector



import AppIcon from '../../ui/AppIcon';
import type { ChildSummary } from '../../../types/parent/parentDashboardTypes';

interface DashboardChildHeaderProps {
  child: ChildSummary | null;
  children: ChildSummary[];
  onChildChange: (childId: string) => void;
}

export function DashboardChildHeader({
  child,
  children,
  onChildChange,
}: DashboardChildHeaderProps) {
  if (!child) return null;

  const displayName = child.preferred_name || child.first_name || child.child_name;
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const examLabel = child.exam_type || 'GCSE';
  const yearLabel = `Year ${child.year_group}`;

  const subtitle = child.insight_message || `${displayName} is getting started with revision sessions`;

  return (
    <div className="flex items-center justify-between mb-4">
      {/* Left: Page title + subtitle */}
      <div>
        <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
        <p className="text-sm text-muted mt-0.5">{subtitle}</p>
      </div>

      {/* Right: Child info */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {child.avatar_url ? (
          <img
            src={child.avatar_url}
            alt={displayName}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
            {initials}
          </div>
        )}

        {/* Name + metadata */}
        <div className="text-right">
          {children.length > 1 ? (
            <div className="relative">
              <select
                value={child.child_id}
                onChange={(e) => onChildChange(e.target.value)}
                className="appearance-none text-sm font-semibold text-dark bg-transparent border-none pr-6 cursor-pointer focus:outline-none focus:ring-0"
              >
                {children.map((c) => (
                  <option key={c.child_id} value={c.child_id} className="text-neutral-800">
                    {c.preferred_name || c.first_name || c.child_name}
                  </option>
                ))}
              </select>
              <AppIcon
                name="chevron-down"
                className="w-3 h-3 text-neutral-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none"
              />
            </div>
          ) : (
            <p className="text-sm font-semibold text-dark">{displayName}</p>
          )}
          <p className="text-xs text-muted">
            {yearLabel} · {examLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardChildHeader;
