// src/components/parentOnboarding/availability/DayCard.tsx
// Individual day card for weekly availability builder
// Extracted from AvailabilityBuilderStep for better maintainability

import { useMemo } from "react";
import AppIcon from "../../ui/AppIcon";
import type { DayTemplate } from "../../../services/parentOnboarding/recommendationService";
import type { AvailabilitySlot, TimeOfDay, SessionPattern } from "../steps/AvailabilityBuilderStep";

/* ============================
   Constants
============================ */

const TIME_OF_DAY_OPTIONS: { value: TimeOfDay; label: string }[] = [
  { value: "early_morning", label: "Early morning" },
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
];

const SESSION_PATTERN_OPTIONS: {
  value: SessionPattern;
  label: string;
  minutes: number;
  topics: number;
}[] = [
  { value: "p20", label: "20 min", minutes: 20, topics: 1 },
  { value: "p45", label: "45 min", minutes: 45, topics: 2 },
  { value: "p70", label: "70 min", minutes: 70, topics: 3 },
];

/* ============================
   Component
============================ */

export interface DayCardProps {
  day: DayTemplate;
  onToggle: () => void;
  onAddSlot: () => void;
  onRemoveSlot: (index: number) => void;
  onUpdateSlot: (
    index: number,
    field: keyof AvailabilitySlot,
    value: string
  ) => void;
}

export function DayCard({
  day,
  onToggle,
  onAddSlot,
  onRemoveSlot,
  onUpdateSlot
}: DayCardProps) {
  const stats = useMemo(() => {
    if (!day.is_enabled || day.slots.length === 0) return null;
    let minutes = 0;
    let topics = 0;
    for (const slot of day.slots) {
      const opt = SESSION_PATTERN_OPTIONS.find(
        (p) => p.value === slot.session_pattern
      );
      minutes += opt?.minutes ?? 45;
      topics += opt?.topics ?? 2;
    }
    return { minutes, topics };
  }, [day.is_enabled, day.slots]);

  return (
    <div
      className={`border-2 rounded-xl transition-all ${
        day.is_enabled ? "border-border bg-background" : "border-border bg-muted"
      }`}
    >
      {/* Day Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggle}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              day.is_enabled ? "bg-primary" : "bg-muted"
            }`}
            aria-label={`${day.is_enabled ? "Disable" : "Enable"} ${day.day_name}`}
          >
            <div
              className={`absolute top-[2px] left-[2px] w-5 h-5 bg-background rounded-full shadow transition-transform ${
                day.is_enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`font-medium ${day.is_enabled ? "text-foreground" : "text-muted-foreground"}`}>
            {day.day_name}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {stats && (
            <span className="text-xs text-muted-foreground">
              {day.slots.length} session{day.slots.length !== 1 ? "s" : ""} · {stats.minutes} min
            </span>
          )}
          {day.is_enabled && (
            <button
              type="button"
              onClick={onAddSlot}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
            >
              <AppIcon name="plus" className="w-3 h-3" aria-hidden />
              Add
            </button>
          )}
        </div>
      </div>

      {/* Sessions List */}
      {day.is_enabled && day.slots.length > 0 && (
        <div className="p-4 space-y-3">
          {day.slots.map((slot, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border"
            >
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Time
                </label>
                <select
                  value={slot.time_of_day}
                  onChange={(e) => onUpdateSlot(idx, "time_of_day", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  {TIME_OF_DAY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Duration
                </label>
                <select
                  value={slot.session_pattern}
                  onChange={(e) => onUpdateSlot(idx, "session_pattern", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  {SESSION_PATTERN_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} ({opt.topics} topic{opt.topics !== 1 ? "s" : ""})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => onRemoveSlot(idx)}
                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex-shrink-0 mt-5"
                aria-label="Remove session"
              >
                <AppIcon name="trash-2" className="w-4 h-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}

      {day.is_enabled && day.slots.length === 0 && (
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">No sessions</p>
          <button
            type="button"
            onClick={onAddSlot}
            className="text-sm text-primary hover:text-primary font-medium inline-flex items-center gap-2"
          >
            <AppIcon name="plus" className="w-4 h-4" aria-hidden />
            Add session
          </button>
        </div>
      )}

      {!day.is_enabled && (
        <div className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Rest day</p>
        </div>
      )}
    </div>
  );
}
