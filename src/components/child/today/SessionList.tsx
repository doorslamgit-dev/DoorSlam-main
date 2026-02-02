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
    <div className="bg-white rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-primary-900">Today's Sessions</h2>
        <div className="bg-primary-100 px-3 py-1 rounded-full">
          <span className="text-primary-700 font-semibold text-sm">
            {totalCount} session{totalCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AppIcon name="book" className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-primary-900 mb-2">No sessions today</h3>
          <p className="text-neutral-600">
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
              className="w-full bg-primary-600 text-white font-semibold py-4 rounded-xl hover:bg-primary-700 transition flex items-center justify-center space-x-2"
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
        <div className="bg-accent-green/10 px-3 py-1 rounded-full">
          <span className="text-accent-green text-xs font-medium">Completed</span>
        </div>
      );
    }
    if (isReady) {
      return (
        <div className="bg-accent-green/10 px-3 py-1 rounded-full">
          <span className="text-accent-green text-xs font-medium">Ready</span>
        </div>
      );
    }
    return (
      <div className="bg-neutral-200 px-3 py-1 rounded-full">
        <span className="text-neutral-600 text-xs font-medium">Pending</span>
      </div>
    );
  };

  return (
    <div
      className="flex items-start space-x-3 p-4 bg-neutral-50 rounded-xl cursor-pointer hover:bg-neutral-100 transition"
      onClick={onStart}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: subjectColor }}
      >
        <AppIcon name={subjectIcon} className="text-white w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-neutral-700 mb-1">{session.subject_name}</h3>
        <p className="text-neutral-500 text-sm truncate">{topicDisplay}</p>
      </div>
      {getStatusBadge()}
    </div>
  );
}