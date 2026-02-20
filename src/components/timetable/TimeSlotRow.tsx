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
      className={`p-2 border-r last:border-r-0 border-neutral-200 min-h-[80px] transition-colors ${
        day.isBlocked
          ? "bg-neutral-100"
          : isOver
            ? "bg-primary-100/50 ring-1 ring-primary-300 ring-inset"
            : day.isToday
              ? "bg-primary-50/30"
              : ""
      }`}
    >
      {day.isBlocked ? (
        <div className="h-full flex items-center justify-center">
          <span className="text-[10px] text-neutral-400 italic">
            No revision
          </span>
        </div>
      ) : !session ? (
        /* Empty cell — no session for this time slot on this day */
        null
      ) : topics.length === 0 ? (
        /* Session exists but no topics assigned yet */
        <div className="text-[10px] text-neutral-400 italic p-1">
          Topics TBD
        </div>
      ) : (
        /* Render topic cards */
        topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topicId={topic.id}
            topicName={topic.topic_name}
            subjectName={session.subject_name}
            subjectColor={getSubjectColor(session.subject_name)}
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
    <div className="grid grid-cols-8 border-b border-neutral-200 last:border-b-0">
      {/* Time slot label column */}
      <div className="p-3 border-r border-neutral-200 bg-neutral-50 flex items-start">
        <div className="text-xs font-medium text-neutral-600">{label}</div>
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
