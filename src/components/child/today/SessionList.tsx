// src/components/child/today/SessionList.tsx
// Today's sessions card with session items

import AppIcon from "../../ui/AppIcon";
import type { SessionRow } from "../../../types/today";
import { getSubjectIcon } from "../../../constants/icons";
import { getSubjectColor } from "../../../constants/colors";

interface SessionListProps {
  sessions: SessionRow[];
  nextSessionId?: string;
  onStartSession: (plannedSessionId: string) => void;
}

export default function SessionList({
  sessions,
  nextSessionId,
  onStartSession,
}: SessionListProps) {
  const totalCount = sessions.length;

  return (
    <div className="bg-background rounded-2xl shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Today's Sessions</h2>
        <div className="bg-primary/10 px-3 py-1 rounded-full">
          <span className="text-primary/90 font-semibold text-sm">
            {totalCount} session{totalCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AppIcon name="book" className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No sessions today</h3>
          <p className="text-muted-foreground">
            Enjoy your break! Check back tomorrow for your next sessions.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {sessions.map((session) => (
              <SessionItem
                key={session.planned_session_id}
                session={session}
                isNext={nextSessionId === session.planned_session_id}
                onStart={() => onStartSession(session.planned_session_id)}
              />
            ))}
          </div>

          {nextSessionId && (
            <button
              onClick={() => onStartSession(nextSessionId)}
              className="w-full bg-primary text-white font-semibold py-4 rounded-xl hover:bg-primary/90 transition flex items-center justify-center space-x-2"
            >
              <span className="text-lg">Start next session</span>
              <AppIcon name="arrow-right" className="w-5 h-5" />
            </button>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Individual session item
 */
function SessionItem({
  session,
  isNext,
  onStart,
}: {
  session: SessionRow;
  isNext: boolean;
  onStart: () => void;
}) {
  const isCompleted = session.status === "completed";
  const isStarted = session.status === "started";
  const isNotStarted = session.status === "not_started";
  const isReady = isNext && (isNotStarted || isStarted);

  const subjectIcon = getSubjectIcon(session.icon);
  const subjectColor = getSubjectColor(session.subject_name);
  const topicDisplay =
    session.topic_names?.[0] || session.topics_preview?.[0]?.topic_name || "Topic TBD";

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <div className="bg-success/10 px-3 py-1 rounded-full">
          <span className="text-success text-xs font-medium">Completed</span>
        </div>
      );
    }
    if (isReady) {
      return (
        <div className="bg-success/10 px-3 py-1 rounded-full">
          <span className="text-success text-xs font-medium">Ready</span>
        </div>
      );
    }
    return (
      <div className="bg-muted px-3 py-1 rounded-full">
        <span className="text-muted-foreground text-xs font-medium">Pending</span>
      </div>
    );
  };

  return (
    <div
      className="flex items-start space-x-3 p-4 bg-muted rounded-xl cursor-pointer hover:bg-muted/80 transition"
      onClick={onStart}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: subjectColor }}
      >
        <AppIcon name={subjectIcon} className="text-white w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground mb-1">{session.subject_name}</h3>
        <p className="text-muted-foreground text-sm truncate">{topicDisplay}</p>
      </div>
      {getStatusBadge()}
    </div>
  );
}