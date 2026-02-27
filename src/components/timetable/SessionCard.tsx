// src/components/timetable/SessionCard.tsx
// Reusable session card used in TodayView.
// Displays subject icon, name, duration, topic count, status badge, and topic previews.
// Updated: Uniform bg-background border-border card — status communicated via badge only.

import AppIcon from "../ui/AppIcon";
import Badge from "../ui/Badge";
import TopicCard from "./TopicCard";
import type { TimetableSession } from "../../services/timetableService";
import { getSubjectIcon } from "../../constants/icons";
import { getSubjectColor } from "../../constants/colors";
import { hexToRgba } from "../../utils/colorUtils";

// ============================================================================
// TYPES
// ============================================================================

interface SessionCardProps {
  /** The session data to display */
  session: TimetableSession;
  /** ISO date string (YYYY-MM-DD) passed to TopicCard for context */
  dateStr: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function SessionCard({ session, dateStr }: SessionCardProps) {
  const isCompleted = session.status === "completed";
  const isStarted = session.status === "started";
  const color = getSubjectColor(session.subject_name);

  return (
    <div className="rounded-xl border-2 border-border bg-background p-4 transition-all hover:shadow-md">
      <div className="flex items-start gap-4">
        {/* Subject Icon — solid fill when active, 12% tint when completed */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: isCompleted ? hexToRgba(color, 0.12) : color,
          }}
        >
          <AppIcon
            name={getSubjectIcon(session.icon)}
            className="w-5 h-5"
            style={{ color: isCompleted ? color : "white" }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-base text-foreground">
                {session.subject_name}
              </h4>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <AppIcon name="clock" className="w-3 h-3" />
                  {session.session_duration_minutes} min
                </span>
                <span>
                  {session.topic_count} topic
                  {session.topic_count !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Status Badge — sole indicator of session state */}
            <Badge
              variant={isCompleted ? "success" : isStarted ? "warning" : "default"}
              badgeStyle="soft"
              size="sm"
              icon={isCompleted ? "check" : "clock"}
            >
              {isCompleted ? "Done" : isStarted ? "In Progress" : "Planned"}
            </Badge>
          </div>

          {/* Topic previews */}
          {session.topics_preview && session.topics_preview.length > 0 && (
            <div className="mt-3 space-y-1">
              {session.topics_preview.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topicId={topic.id}
                  topicName={topic.topic_name}
                  subjectName={topic.subject_name}
                  subjectColor={getSubjectColor(topic.subject_name)}
                  sessionStatus={session.status}
                  sessionDate={dateStr}
                  plannedSessionId={session.planned_session_id}
                  canEdit={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
