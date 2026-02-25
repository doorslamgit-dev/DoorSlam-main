// src/components/child/today/SessionCard.tsx
// FEAT-010: Replace emoji/SVG icons with AppIcon for consistency

import AppIcon from "../../ui/AppIcon";
import {
  formatDuration,
  getPatternLabel,
  getSubjectIcon,
  getSubjectColorClass,
} from "../../../utils/dateUtils";
import SessionStatus from "./SessionStatus";
import type { SessionRow } from "../../../types/today";

type SessionCardProps = {
  session: SessionRow;
  sessionNumber: number;
  isNext: boolean;
  isLocked: boolean;
  onStart: () => void;
};

export default function SessionCard({
  session,
  sessionNumber,
  isNext,
  isLocked,
  onStart,
}: SessionCardProps) {
  const isStarted = session.status === "started";
  const icon = getSubjectIcon(session.subject_name);
  const colorClass = getSubjectColorClass(session.subject_name);

  // Get topics from preview
  const topics =
    session.topics_preview?.map((t: { topic_name: string }) => t.topic_name) || [];

  return (
    <div
      className={`bg-background rounded-2xl border shadow-sm overflow-hidden transition-all ${
        session.status === "completed"
          ? "border-success-border dark:border-green-800 opacity-75"
          : isLocked
          ? "border-border opacity-60"
          : isNext
          ? "border-primary-300 dark:border-primary-700 ring-2 ring-primary/10 dark:ring-primary-900/50"
          : "border-border"
      }`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center ${colorClass}`}
              aria-hidden
            >
              <AppIcon name={icon} className="w-7 h-7" aria-hidden />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {session.subject_name || "Subject"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Session {sessionNumber} • {getPatternLabel(session.session_pattern)}
              </p>
            </div>
          </div>

          <SessionStatus status={session.status} isLocked={isLocked} />
        </div>

        {/* Session info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <AppIcon name="clock" className="w-4 h-4" aria-hidden />
            {formatDuration(session.session_duration_minutes)}
          </div>

          <div className="flex items-center gap-1.5">
            <AppIcon name="clipboard-list" className="w-4 h-4" aria-hidden />
            {session.topic_count || 1} topic{(session.topic_count || 1) !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Topic progress for in-progress sessions */}
        {isStarted && session.total_topics && session.total_topics > 1 && (
          <div className="mb-4 p-3 bg-warning/10 rounded-xl border border-warning-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-warning">Topic Progress</span>
              <span className="text-sm text-warning">
                {(session.current_topic_index ?? 0) + 1} of {session.total_topics}
              </span>
            </div>

            <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-warning rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (((session.current_topic_index ?? 0) + 1) / session.total_topics) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Topics preview */}
        {topics.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {topics.slice(0, 3).map((topic: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-secondary text-foreground text-xs rounded-full"
                >
                  {topic}
                </span>
              ))}
              {topics.length > 3 && (
                <span className="px-3 py-1 bg-secondary text-muted-foreground text-xs rounded-full">
                  +{topics.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action button */}
        <SessionActionButton status={session.status} isLocked={isLocked} onStart={onStart} />
      </div>
    </div>
  );
}

function SessionActionButton({
  status,
  isLocked,
  onStart,
}: {
  status: string;
  isLocked: boolean;
  onStart: () => void;
}) {
  if (status === "completed") {
    return (
      <button
        onClick={onStart}
        className="w-full py-3 rounded-xl bg-success/10 text-success font-medium hover:bg-success/10 transition-colors"
      >
        Review session
      </button>
    );
  }

  if (isLocked) {
    return (
      <div className="w-full py-3 rounded-xl bg-secondary text-muted-foreground font-medium text-center flex items-center justify-center gap-2">
        <AppIcon name="lock" className="w-4 h-4" aria-hidden />
        Complete previous session first
      </div>
    );
  }

  if (status === "started") {
    return (
      <button
        onClick={onStart}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
      >
        Continue session
      </button>
    );
  }

  return (
    <button
      onClick={onStart}
      className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
    >
      Start session
    </button>
  );
}
