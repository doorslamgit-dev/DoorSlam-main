// src/components/parent/dashboard/DashboardRecentActivity.tsx
// Recent activity card for dashboard context, using ComingUpSession and SubjectCoverage data


import AppIcon from '../../ui/AppIcon';
import EmptyState from '../../ui/EmptyState';
import type { IconKey } from '../../ui/AppIcon';
import { hexToRgba } from '../../../utils/colorUtils';
import { useSubjectColor } from '../../../contexts/SubjectColorContext';
import type {
  ComingUpSession,
  SubjectCoverage,
} from '../../../types/parent/parentDashboardTypes';

interface DashboardRecentActivityProps {
  comingUp: ComingUpSession[];
  coverage: SubjectCoverage[];
}

interface ActivityItem {
  id: string;
  icon: IconKey;
  iconColor: string;
  title: string;
  detail: string;
  timeLabel: string;
}

export function DashboardRecentActivity({
  comingUp,
  coverage,
}: DashboardRecentActivityProps) {
  const { getColor } = useSubjectColor();
  const activities: ActivityItem[] = [];

  // Add upcoming sessions as activity items
  comingUp.slice(0, 3).forEach((session) => {
    activities.push({
      id: session.planned_session_id,
      icon: 'calendar',
      iconColor: getColor(session.subject_id, session.subject_color),
      title: `${session.subject_name} — ${session.topic_name}`,
      detail: `${session.session_duration_minutes} min session`,
      timeLabel: session.is_today
        ? 'Today'
        : session.is_tomorrow
          ? 'Tomorrow'
          : session.day_label,
    });
  });

  // Add subjects with good coverage as recent progress
  coverage
    .filter((s) => s.sessions_completed > 0)
    .sort((a, b) => b.sessions_completed - a.sessions_completed)
    .slice(0, Math.max(0, 4 - activities.length))
    .forEach((s) => {
      activities.push({
        id: `coverage-${s.subject_id}`,
        icon: 'check-circle',
        iconColor: getColor(s.subject_id, s.subject_color),
        title: `${s.subject_name} progress`,
        detail: `${s.topics_covered} topics covered`,
        timeLabel: `${s.sessions_completed} sessions`,
      });
    });

  if (activities.length === 0) {
    return (
      <div className="bg-background rounded-2xl shadow-sm p-4 border border-border">
        <h3 className="text-sm font-bold text-foreground mb-3">Recent Activity</h3>
        <EmptyState
          variant="minimal"
          icon="clock"
          title="No recent activity yet"
          iconColor="text-muted-foreground"
        />
      </div>
    );
  }

  return (
    <div className="bg-background rounded-2xl shadow-sm p-4 border border-border">
      <h3 className="text-sm font-bold text-foreground mb-3">Recent Activity</h3>

      <div className="space-y-2">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: hexToRgba(activity.iconColor, 0.12) }}
            >
              <AppIcon
                name={activity.icon}
                className="w-3.5 h-3.5"
                style={{ color: activity.iconColor }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">{activity.title}</p>
              <p className="text-2xs text-muted-foreground truncate">{activity.detail}</p>
            </div>
            <span className="text-2xs text-muted-foreground shrink-0">{activity.timeLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardRecentActivity;
