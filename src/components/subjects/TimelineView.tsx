// src/components/subjects/TimelineView.tsx

import type { TimelineGroup } from "../../types/subjectProgress";
import { getSubjectColor } from "../../constants/colors";

interface TimelineViewProps {
  timeline: TimelineGroup[];
}

export default function TimelineView({ timeline }: TimelineViewProps) {
  if (timeline.length === 0) {
    return (
      <div className="bg-neutral-0 rounded-xl shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Next Two Weeks Timeline
        </h3>
        <p className="text-sm text-neutral-500">
          No sessions scheduled for the next two weeks.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-0 rounded-xl shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">
          Next Two Weeks Timeline
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg"
          >
            This View
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg"
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
              groupIndex === 0 ? "border-primary-600" : "border-neutral-300"
            }`}
          >
            <p className="text-xs font-medium text-neutral-500 mb-2">
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
                  <p className="text-sm text-neutral-900">
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
