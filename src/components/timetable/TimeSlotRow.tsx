// src/components/timetable/TimeSlotRow.tsx
// Renders one row of the time-slot grid (label + 7 droppable day cells).

import { useDroppable } from "@dnd-kit/core";
import TopicCard from "./TopicCard";
import { TIME_SLOT_LABELS } from "../../utils/timetableUtils";
import { getSubjectColor } from "../../constants/colors";
import type { TimetableSession } from "../../services/timetableService";

export interface DayCellData {
  dateStr: string;
  isBlocked: boolean;
  isToday: boolean;
  session: TimetableSession | null;
}

interface TimeSlotRowProps {
  timeSlot: string;
  days: DayCellData[];
  canEdit: boolean;
  isDragEnabled?: boolean;
  onDeleteTopic?: (topicId: string, plannedSessionId: string) => void;
}

/** A single droppable cell (day × time slot) */
function DroppableCell({
  cellId,
  day,
  session,
  canEdit,
  isDragEnabled,
  onDeleteTopic,
}: {
  cellId: string;
  day: DayCellData;
  session: TimetableSession | null;
  canEdit: boolean;
  isDragEnabled: boolean;
  onDeleteTopic?: (topicId: string, plannedSessionId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: cellId,
    disabled: day.isBlocked || (session?.status === "completed"),
    data: {
      dateStr: day.dateStr,
      session,
    },
  });

  const topics = session?.topics_preview ?? [];

  return (
    <div
      ref={setNodeRef}
      className={`p-2 border-r last:border-r-0 border-border min-h-[80px] transition-colors ${
        day.isBlocked
          ? "bg-secondary"
          : isOver
            ? "bg-primary/10 ring-2 ring-ring ring-inset"
            : day.isToday
              ? "bg-primary/5"
              : ""
      }`}
    >
      {day.isBlocked ? (
        <div className="h-full flex items-center justify-center">
          <span className="text-[10px] text-muted-foreground italic">
            No revision
          </span>
        </div>
      ) : isOver && !session ? (
        /* Empty cell with drag hover — show drop indicator */
        <div className="h-full flex items-center justify-center">
          <span className="text-[10px] text-primary font-medium">
            Drop here
          </span>
        </div>
      ) : !session ? (
        /* Empty cell — no session for this time slot on this day */
        null
      ) : topics.length === 0 ? (
        /* Session exists but no topics assigned yet */
        <div className="text-[10px] text-muted-foreground italic p-1">
          Topics TBD
        </div>
      ) : (
        /* Render topic cards */
        topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topicId={topic.id}
            topicName={topic.topic_name}
            subjectName={topic.subject_name}
            subjectColor={getSubjectColor(topic.subject_name)}
            sessionStatus={session.status}
            sessionDate={session.session_date}
            plannedSessionId={session.planned_session_id}
            canEdit={canEdit}
            isDragEnabled={isDragEnabled}
            onDelete={onDeleteTopic}
          />
        ))
      )}
    </div>
  );
}

export default function TimeSlotRow({
  timeSlot,
  days,
  canEdit,
  isDragEnabled = false,
  onDeleteTopic,
}: TimeSlotRowProps) {
  const label = TIME_SLOT_LABELS[timeSlot] || timeSlot;

  return (
    <div className="grid grid-cols-8 border-b border-border last:border-b-0">
      {/* Time slot label column */}
      <div className="p-3 border-r border-border bg-muted flex items-start">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
      </div>

      {/* 7 droppable day cells */}
      {days.map((day, dayIndex) => {
        const session = day.session;
        const cellId = `${day.dateStr}:${timeSlot}`;

        return (
          <DroppableCell
            key={dayIndex}
            cellId={cellId}
            day={day}
            session={session}
            canEdit={canEdit}
            isDragEnabled={isDragEnabled}
            onDeleteTopic={onDeleteTopic}
          />
        );
      })}
    </div>
  );
}
