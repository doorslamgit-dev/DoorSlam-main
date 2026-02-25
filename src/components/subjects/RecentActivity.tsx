// src/components/subjects/RecentActivity.tsx

import type { SubjectProgress } from "../../types/subjectProgress";
import AppIcon from "../ui/AppIcon";
import { COLORS, ACTIVITY_COLORS, getSubjectColor } from "../../constants/colors";

interface RecentActivityProps {
  subjects: SubjectProgress[];
}

interface Activity {
  id: string;
  type: "completed" | "submitted" | "needs_practice";
  subject: string;
  topic: string;
  color: string;
  timeAgo: string;
}

export default function RecentActivity({ subjects }: RecentActivityProps) {
  const activities: Activity[] = [];

  // Gather recent activities from all subjects
  subjects.forEach((subject) => {
    // Add recently covered topics as "completed" activities
    const recentTopics = subject.recently_covered?.slice(0, 1) || [];
    recentTopics.forEach((topic) => {
      activities.push({
        id: `${subject.subject_id}-${topic.topic_id}`,
        type: "completed",
        subject: subject.subject_name,
        topic: topic.topic_name,
        color: getSubjectColor(subject.subject_name),
        timeAgo: formatDaysAgo(topic.days_since),
      });
    });
  });

  // Add "needs practice" for subjects that need attention
  subjects.forEach((subject) => {
    if (subject.status === "needs_attention" && activities.length < 5) {
      const upcomingTopic = subject.coming_up?.[0];
      if (upcomingTopic) {
        activities.push({
          id: `${subject.subject_id}-practice`,
          type: "needs_practice",
          subject: subject.subject_name,
          topic: upcomingTopic.topic_name,
          color: getSubjectColor(subject.subject_name),
          timeAgo: "review needed",
        });
      }
    }
  });

  // Sort and take top 3 (kept as your original behaviour)
  const recentActivities = activities.slice(0, 3);

  if (recentActivities.length === 0) {
    return (
      <div className="bg-background rounded-2xl shadow-soft p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Recent Activity
        </h3>
        <p className="text-sm text-center py-4 text-muted-foreground">
          No recent activity
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-2xl shadow-soft p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        Recent Activity
      </h3>

      <div className="space-y-3">
        {recentActivities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="mt-0.5 flex-shrink-0">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${getActivityColor(activity.type)}15` }}
              >
                <AppIcon
                  name={getActivityIcon(activity.type)}
                  className="w-4 h-4"
                  aria-hidden
                />
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-foreground">
                {getActivityTitle(activity.type, activity.subject)}
              </div>
              <div className="text-xs text-muted-foreground">
                {activity.topic} • {activity.timeAgo}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDaysAgo(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  return `${Math.floor(days / 7)} weeks ago`;
}

function getActivityColor(type: Activity["type"]): string {
  return ACTIVITY_COLORS[type] || COLORS.primary[600];
}

function getActivityIcon(type: Activity["type"]) {
  switch (type) {
    case "completed":
      return "check-circle" as const;
    case "submitted":
      return "pencil" as const;
    case "needs_practice":
      return "triangle-alert" as const;
    default:
      return "circle" as const;
  }
}

function getActivityTitle(type: Activity["type"], subject: string): string {
  switch (type) {
    case "completed":
      return `${subject} session completed`;
    case "submitted":
      return `${subject} work submitted`;
    case "needs_practice":
      return `${subject} practice needed`;
    default:
      return `${subject} activity`;
  }
}
