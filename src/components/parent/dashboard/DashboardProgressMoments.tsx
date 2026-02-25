// src/components/parent/dashboard/DashboardProgressMoments.tsx
// Compact progress moments card for dashboard context


import AppIcon from '../../ui/AppIcon';
import EmptyState from '../../ui/EmptyState';
import type { IconKey } from '../../ui/AppIcon';
import type { ProgressMoment, MomentType } from '../../../types/parent/parentDashboardTypes';

interface DashboardProgressMomentsProps {
  moments: ProgressMoment[];
}

const momentIcons: Record<MomentType, { bg: string; icon: IconKey }> = {
  achievement: { bg: 'bg-warning', icon: 'trophy' },
  sessions_milestone: { bg: 'bg-success', icon: 'check-circle' },
  streak_milestone: { bg: 'bg-warning', icon: 'flame' },
  getting_started: { bg: 'bg-primary', icon: 'sprout' },
  focus_mode: { bg: 'bg-primary', icon: 'bolt' },
};

export function DashboardProgressMoments({ moments }: DashboardProgressMomentsProps) {
  if (moments.length === 0) {
    return (
      <div className="bg-background rounded-2xl shadow-sm p-4 border border-border">
        <h3 className="text-sm font-bold text-foreground mb-3">Progress Moments</h3>
        <EmptyState
          variant="minimal"
          icon="sparkles"
          title="Moments will appear as progress is made"
          iconColor="text-primary"
        />
      </div>
    );
  }

  return (
    <div className="bg-background rounded-2xl shadow-sm p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground">Progress Moments</h3>
        <AppIcon name="sparkles" className="w-4 h-4 text-warning" />
      </div>

      <div className="space-y-2">
        {moments.slice(0, 3).map((moment, index) => {
          const config = momentIcons[moment.moment_type] ?? momentIcons.getting_started;
          return (
            <div
              key={`${moment.child_id}-${moment.moment_type}-${index}`}
              className="flex items-center gap-2.5"
            >
              <div
                className={`w-7 h-7 ${config.bg} rounded-full flex items-center justify-center shrink-0`}
              >
                <AppIcon name={config.icon} className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground truncate">{moment.message}</p>
                <p className="text-[10px] text-muted-foreground truncate">{moment.sub_message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardProgressMoments;
