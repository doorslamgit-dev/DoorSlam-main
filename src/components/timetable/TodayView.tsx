// src/components/timetable/TodayView.tsx
// Today's sessions grouped by time slot, with TopicCards inside each session.

import { useMemo } from "react";
import AppIcon from "../ui/AppIcon";
import Button from "../ui/Button";
import SessionCard from "./SessionCard";
import type { TimetableSession } from "../../services/timetableService";
import { TIME_SLOT_LABELS, TIME_SLOT_ORDER } from "../../utils/timetableUtils";

interface TodayViewProps {
  sessions: TimetableSession[];
  date: Date;
  onAddSession: () => void;
  loading?: boolean;
}

interface TimeSlotGroup {
  slot: string;
  label: string;
  sessions: TimetableSession[];
}

export default function TodayView({
  sessions,
  date,
  onAddSession,
  loading = false,
}: TodayViewProps) {
  const isToday = new Date().toDateString() === date.toDateString();
  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
  const dateStr = date.toISOString().split("T")[0];

  // Group sessions by time_of_day
  const slotGroups = useMemo((): TimeSlotGroup[] => {
    const groups: TimeSlotGroup[] = [];

    for (const slot of TIME_SLOT_ORDER) {
      const slotSessions = sessions.filter(
        (s) => s.time_of_day === slot
      );
      if (slotSessions.length > 0) {
        groups.push({
          slot,
          label: TIME_SLOT_LABELS[slot] || slot,
          sessions: slotSessions,
        });
      }
    }

    // Unscheduled sessions (no time_of_day)
    const unscheduled = sessions.filter((s) => !s.time_of_day);
    if (unscheduled.length > 0) {
      groups.push({
        slot: "unscheduled",
        label: "Unscheduled",
        sessions: unscheduled,
      });
    }

    return groups;
  }, [sessions]);

  if (loading) {
    return (
      <div className="bg-background rounded-2xl shadow-sm p-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-64 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-secondary rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden">
      {/* Header */}
      <div
        className={`px-6 py-4 border-b ${
          isToday
            ? "bg-primary/5 border-primary/20"
            : "bg-muted border-border"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2
              className={`text-2xl font-bold font-display ${
                isToday ? "text-primary" : "text-foreground"
              }`}
            >
              {date.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""}{" "}
              scheduled
              {isToday && " \u2022 Today"}
            </p>
          </div>
          {!isPast && (
            <Button
              variant="primary"
              size="sm"
              leftIcon="plus"
              onClick={onAddSession}
            >
              Add Session
            </Button>
          )}
        </div>
      </div>

      {/* Sessions grouped by time slot */}
      <div className="p-6">
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <AppIcon name="book" className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No sessions scheduled
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isPast
                ? "No revision was scheduled for this day."
                : "Add a session to start revising on this day."}
            </p>
            {!isPast && (
              <Button variant="primary" size="sm" onClick={onAddSession}>
                Add Session
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {slotGroups.map((group) => (
              <div key={group.slot}>
                {/* Time slot header */}
                <div className="flex items-center gap-2 mb-3">
                  <AppIcon
                    name="clock"
                    className="w-4 h-4 text-muted-foreground"
                  />
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    {group.label}
                  </h3>
                  <div className="flex-1 h-px bg-muted" />
                </div>

                {/* Sessions in this slot */}
                <div className="space-y-3">
                  {group.sessions.map((session) => (
                    <SessionCard
                      key={session.planned_session_id}
                      session={session}
                      dateStr={dateStr}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
