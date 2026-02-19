// src/components/parent/dashboard/DashboardRecentActivity.tsx
// Recent activity card for dashboard context, using ComingUpSession and SubjectCoverage data


import AppIcon from '../../ui/AppIcon';
import type { IconKey } from '../../ui/AppIcon';
import { getSubjectColor } from '../../../constants/colors';
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
  const activities: ActivityItem[] = [];

  // Add upcoming sessions as activity items
  comingUp.slice(0, 3).forEach((session) => {
    activities.push({
      id: session.planned_session_id,
      icon: 'calendar',
      iconColor: getSubjectColor(session.subject_name),
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
        iconColor: getSubjectColor(s.subject_name),
        title: `${s.subject_name} progress`,
        detail: `${s.topics_covered} topics covered`,
        timeLabel: `${s.sessions_completed} sessions`,
      });
    });

  if (activities.length === 0) {
    return (
      <div className="bg-neutral-0 rounded-2xl shadow-card p-4 border border-neutral-200/50">
        <h3 className="text-sm font-bold text-neutral-800 mb-3">Recent Activity</h3>
        <div className="text-center py-4">
          <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <AppIcon name="clock" className="w-5 h-5 text-neutral-400" />
          </div>
          <p className="text-xs text-neutral-500">No recent activity yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-0 rounded-2xl shadow-card p-4 border border-neutral-200/50">
      <h3 className="text-sm font-bold text-neutral-800 mb-3">Recent Activity</h3>

      <div className="space-y-2">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${activity.iconColor}20` }}
            >
              <AppIcon
                name={activity.icon}
                className="w-3.5 h-3.5"
                style={{ color: activity.iconColor }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-neutral-700 truncate">{activity.title}</p>
              <p className="text-[10px] text-neutral-500 truncate">{activity.detail}</p>
            </div>
            <span className="text-[10px] text-neutral-400 shrink-0">{activity.timeLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardRecentActivity;
