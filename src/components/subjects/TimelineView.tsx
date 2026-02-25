// src/components/subjects/TimelineView.tsx

import type { TimelineGroup } from "../../types/subjectProgress";
import { getSubjectColor } from "../../constants/colors";

interface TimelineViewProps {
  timeline: TimelineGroup[];
}

export default function TimelineView({ timeline }: TimelineViewProps) {
  if (timeline.length === 0) {
    return (
      <div className="bg-background rounded-xl shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Next Two Weeks Timeline
        </h3>
        <p className="text-sm text-muted-foreground">
          No sessions scheduled for the next two weeks.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Next Two Weeks Timeline
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-1.5 text-xs font-medium text-primary bg-primary/5 rounded-lg"
          >
            This View
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg"
          >
            Month View
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {timeline.map((group, groupIndex) => (
          <div
            key={group.group_label}
            className={`border-l-4 pl-4 py-2 ${
              groupIndex === 0 ? "border-primary" : "border-input"
            }`}
          >
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {group.group_label}
            </p>

            <div className="space-y-2">
              {group.sessions.map((session) => (
                <div
                  key={session.planned_session_id}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getSubjectColor(session.subject_name) }}
                  />
                  <p className="text-sm text-foreground">
                    {session.subject_name}: {session.topic_name || "Topic TBD"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
