// src/components/timetable/WeekView.tsx
// Time-slot grid with @dnd-kit: rows = time slots, columns = days.
// Topics can be dragged between cells (cross-day, cross-slot).

import { useMemo, useCallback, useState } from "react";
import {
  DndContext,
  pointerWithin,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  getWeekStart,
  formatDateISO,
  removeTopicFromSession,
  moveTopicBetweenSessions,
  createSessionAndMoveTopic,
  getMaxTopicsForPattern,
  type WeekDayData,
  type TimetableSession,
} from "../../services/timetableService";
import TimeSlotRow from "./TimeSlotRow";
import { TIME_SLOT_ORDER } from "../../utils/timetableUtils";
import { getSubjectColor } from "../../constants/colors";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export interface WeekViewProps {
  weekData: WeekDayData[];
  referenceDate: Date;
  isDateBlocked: (dateStr: string) => boolean;
  canEdit?: boolean;
  childId?: string;
  onDataChanged?: () => void;
  /** For child "requires_approval" mode: instead of moving, submit a request */
  onMoveRequiresApproval?: (
    topicId: string,
    topicName: string,
    subjectName: string,
    sourceSessionId: string,
    targetSessionId: string,
    sourceLabel: string,
    targetLabel: string
  ) => void;
}

/**
 * Build a lookup: `${day_date}:${time_of_day}` -> TimetableSession
 */
function buildSessionLookup(
  weekData: WeekDayData[]
): Map<string, TimetableSession> {
  const map = new Map<string, TimetableSession>();

  for (const dayData of weekData) {
    for (const session of dayData.sessions) {
      const slot = session.time_of_day ?? "unscheduled";
      const key = `${dayData.day_date}:${slot}`;
      if (!map.has(key)) {
        map.set(key, session);
      }
    }
  }

  return map;
}

export function WeekView({
  weekData,
  referenceDate,
  isDateBlocked,
  canEdit = true,
  childId,
  onDataChanged,
  onMoveRequiresApproval,
}: WeekViewProps) {
  const weekStart = getWeekStart(referenceDate);
  const isDragEnabled = canEdit;

  // Active drag state for overlay
  const [activeDragData, setActiveDragData] = useState<{
    topicName: string;
    subjectName: string;
    subjectColor: string;
  } | null>(null);

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor)
  );

  // Build day metadata
  const dayMeta = useMemo(() => {
    const todayStr = new Date().toDateString();
    return DAYS.map((_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateStr = formatDateISO(date);
      return {
        date,
        dateStr,
        isBlocked: isDateBlocked(dateStr),
        isToday: date.toDateString() === todayStr,
      };
    });
  }, [weekStart, isDateBlocked]);

  // Session lookup
  const sessionLookup = useMemo(() => buildSessionLookup(weekData), [weekData]);

  // Determine active time slots
  const activeSlots = useMemo(() => {
    const slotsWithData: string[] = [];

    for (const slot of TIME_SLOT_ORDER) {
      const hasSession = dayMeta.some((day) =>
        sessionLookup.has(`${day.dateStr}:${slot}`)
      );
      if (hasSession) {
        slotsWithData.push(slot);
      }
    }

    const hasUnscheduled = dayMeta.some((day) =>
      sessionLookup.has(`${day.dateStr}:unscheduled`)
    );
    if (hasUnscheduled) {
      slotsWithData.push("unscheduled");
    }

    return slotsWithData;
  }, [dayMeta, sessionLookup]);

  // Handle topic deletion
  const handleDeleteTopic = useCallback(
    async (topicId: string, plannedSessionId: string) => {
      const result = await removeTopicFromSession(topicId, plannedSessionId);
      if (result.success) {
        onDataChanged?.();
      } else {
        console.error("Failed to remove topic:", result.error);
      }
    },
    [onDataChanged]
  );

  // Drag start — show overlay
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current;
      if (data) {
        setActiveDragData({
          topicName: data.topicName as string,
          subjectName: data.subjectName as string,
          subjectColor: getSubjectColor(data.subjectName as string),
        });
      }
    },
    []
  );

  // Find a session by ID across all week data
  const findSourceSession = useCallback(
    (sessionId: string): TimetableSession | null => {
      for (const day of weekData) {
        for (const session of day.sessions) {
          if (session.planned_session_id === sessionId) return session;
        }
      }
      return null;
    },
    [weekData]
  );

  // Drag end — move topic between sessions (or create new session for empty cells)
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveDragData(null);

      const { active, over } = event;
      if (!over) return;

      // Parse source: draggable ID = "plannedSessionId:topicId"
      const activeIdStr = String(active.id);
      const [sourceSessionId, topicId] = activeIdStr.split(":");
      if (!sourceSessionId || !topicId) return;

      // Parse target data from droppable
      const overIdStr = String(over.id);
      const overData = over.data.current;
      const targetSession = overData?.session as TimetableSession | null;
      const targetDateStr = overData?.dateStr as string | undefined;

      // If dropped on the same session, do nothing
      if (targetSession?.planned_session_id === sourceSessionId) return;

      if (targetSession) {
        // --- Drop on existing session ---
        const maxTopics = getMaxTopicsForPattern(targetSession.session_pattern);
        const currentCount = targetSession.topics_preview?.length ?? 0;
        if (currentCount >= maxTopics) {
          console.warn("Target session is full");
          return;
        }

        // If requires approval mode, delegate to parent
        if (onMoveRequiresApproval) {
          const activeData = active.data.current;
          onMoveRequiresApproval(
            topicId,
            (activeData?.topicName as string) || "Topic",
            (activeData?.subjectName as string) || "Subject",
            sourceSessionId,
            targetSession.planned_session_id,
            activeIdStr,
            overIdStr
          );
          return;
        }

        const result = await moveTopicBetweenSessions(
          topicId,
          sourceSessionId,
          targetSession.planned_session_id
        );

        if (result.success) {
          onDataChanged?.();
        } else {
          console.error("Failed to move topic:", result.error);
        }
      } else if (childId && targetDateStr) {
        // --- Drop on empty cell — create session on the fly ---
        const sourceSession = findSourceSession(sourceSessionId);
        if (!sourceSession) return;

        // Parse the time slot from the droppable ID (format: "dateStr:timeSlot")
        const parts = overIdStr.split(":");
        const targetTimeSlot = parts.length > 1 ? parts[parts.length - 1] : "afternoon";

        const result = await createSessionAndMoveTopic({
          childId,
          topicId,
          sourceSessionId,
          targetDate: targetDateStr,
          targetTimeOfDay: targetTimeSlot,
          subjectId: sourceSession.subject_id,
          sessionPattern: sourceSession.session_pattern,
          sessionDurationMinutes: sourceSession.session_duration_minutes,
        });

        if (result.success) {
          onDataChanged?.();
        } else {
          console.error("Failed to create session and move topic:", result.error);
        }
      }
    },
    [childId, onDataChanged, onMoveRequiresApproval, findSourceSession]
  );

  const gridContent = (
    <div className="bg-neutral-0 rounded-2xl shadow-card overflow-hidden mb-6">
      {/* Header Row */}
      <div className="grid grid-cols-8 border-b border-neutral-200">
        <div className="p-3 border-r bg-neutral-50 border-neutral-200">
          <div className="text-xs font-medium text-neutral-600">Time</div>
        </div>
        {dayMeta.map((day, index) => (
          <div
            key={index}
            className={`p-3 text-center border-r last:border-r-0 border-neutral-200 ${
              day.isBlocked
                ? "bg-neutral-200"
                : day.isToday
                  ? "bg-primary-50"
                  : "bg-neutral-0"
            }`}
          >
            <div
              className={`text-sm font-medium ${
                day.isBlocked
                  ? "text-neutral-500"
                  : day.isToday
                    ? "text-primary-600"
                    : "text-neutral-700"
              }`}
            >
              {DAYS[index]}
            </div>
            <div
              className={`text-xs ${
                day.isBlocked
                  ? "text-neutral-400"
                  : day.isToday
                    ? "text-primary-600"
                    : "text-neutral-500"
              }`}
            >
              {day.date.getDate()}
            </div>
            {day.isBlocked && (
              <div className="text-[10px] text-neutral-400 mt-0.5">
                Blocked
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Time-slot rows */}
      {activeSlots.length === 0 ? (
        <div className="p-8 text-center text-sm text-neutral-500">
          No sessions scheduled this week
        </div>
      ) : (
        activeSlots.map((slot) => (
          <TimeSlotRow
            key={slot}
            timeSlot={slot}
            days={dayMeta.map((day) => ({
              dateStr: day.dateStr,
              isBlocked: day.isBlocked,
              isToday: day.isToday,
              session: sessionLookup.get(`${day.dateStr}:${slot}`) ?? null,
            }))}
            canEdit={canEdit}
            isDragEnabled={isDragEnabled}
            onDeleteTopic={handleDeleteTopic}
          />
        ))
      )}
    </div>
  );

  // Wrap in DndContext when editing is enabled
  if (!isDragEnabled) {
    return gridContent;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {gridContent}

      {/* Drag overlay — floating card following cursor */}
      <DragOverlay>
        {activeDragData && (
          <div
            className="rounded-lg p-2 shadow-lg ring-2 ring-primary-200 rotate-1"
            style={{
              backgroundColor: `${activeDragData.subjectColor}25`,
              borderLeft: `3px solid ${activeDragData.subjectColor}`,
              width: 140,
            }}
          >
            <div
              className="text-xs font-semibold leading-tight"
              style={{ color: activeDragData.subjectColor }}
            >
              {activeDragData.topicName}
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">
              {activeDragData.subjectName}
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
