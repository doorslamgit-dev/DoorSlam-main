// src/components/timetable/TopicCard.tsx
// Individual topic card for the time-slot grid. Shows topic name, subject,
// delete X (if editable), status dot, and supports drag via @dnd-kit.

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import AppIcon from "../ui/AppIcon";

export interface TopicCardProps {
  topicId: string;
  topicName: string;
  subjectName: string;
  subjectColor: string;
  sessionStatus: string;
  sessionDate: string;
  plannedSessionId: string;
  canEdit: boolean;
  isDragEnabled?: boolean;
  onDelete?: (topicId: string, plannedSessionId: string) => void;
}

/**
 * Determine the status dot colour class:
 * - green: session completed
 * - orange: session planned/started and date is today or future
 * - red: session planned and date is in the past (missed)
 */
function getStatusDotClass(status: string, dateStr: string): string {
  if (status === "completed") return "bg-accent-green";

  const sessionDate = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (sessionDate < today) return "bg-accent-red";
  return "bg-accent-amber";
}

export default function TopicCard({
  topicId,
  topicName,
  subjectName,
  subjectColor,
  sessionStatus,
  sessionDate,
  plannedSessionId,
  canEdit,
  isDragEnabled = false,
  onDelete,
}: TopicCardProps) {
  const dotClass = getStatusDotClass(sessionStatus, sessionDate);

  // Draggable — ID encodes both session and topic
  const draggableId = `${plannedSessionId}:${topicId}`;
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: draggableId,
      disabled: !isDragEnabled || sessionStatus === "completed",
      data: {
        topicId,
        topicName,
        subjectName,
        plannedSessionId,
      },
    });

  const style = {
    backgroundColor: `${subjectColor}15`,
    borderLeft: `3px solid ${subjectColor}`,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      className={`relative rounded-lg p-2 mb-1.5 last:mb-0 transition-all group ${
        isDragging
          ? "shadow-lg ring-2 ring-primary-200 z-50"
          : "hover:opacity-90"
      }`}
      style={style}
    >
      {/* Drag handle + Delete X row */}
      {canEdit && (
        <div className="absolute top-1 right-1 flex items-center gap-0.5">
          {/* Drag handle */}
          {isDragEnabled && sessionStatus !== "completed" && (
            <button
              {...attributes}
              {...listeners}
              type="button"
              className="w-4 h-4 flex items-center justify-center cursor-grab touch-none opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Drag to move"
            >
              <AppIcon
                name="grip-vertical"
                className="w-2.5 h-2.5 text-neutral-400"
              />
            </button>
          )}

          {/* Delete X */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(topicId, plannedSessionId);
              }}
              className="w-4 h-4 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-200"
              aria-label={`Remove ${topicName}`}
            >
              <AppIcon
                name="x"
                className="w-2.5 h-2.5 text-neutral-500 hover:text-danger"
              />
            </button>
          )}
        </div>
      )}

      {/* Topic name */}
      <div
        className="text-xs font-semibold pr-6 leading-tight"
        style={{ color: subjectColor }}
      >
        {topicName}
      </div>

      {/* Subject label */}
      <div className="text-[10px] text-neutral-500 mt-0.5 leading-tight">
        {subjectName}
      </div>

      {/* Status dot — bottom right */}
      <div
        className={`absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full ${dotClass}`}
        title={
          sessionStatus === "completed"
            ? "Completed"
            : dotClass === "bg-accent-red"
              ? "Missed"
              : "Pending"
        }
      />
    </div>
  );
}
