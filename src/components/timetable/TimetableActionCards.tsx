// src/components/timetable/TimetableActionCards.tsx

import Button from "../ui/Button";

interface TimetableActionCardsProps {
  onAddSession: () => void;
  onEditSchedule: () => void;
  onBlockDates: () => void;
}

export default function TimetableActionCards({
  onAddSession,
  onEditSchedule,
  onBlockDates,
}: TimetableActionCardsProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Button
        variant="secondary"
        size="sm"
        leftIcon="plus-circle"
        onClick={onAddSession}
      >
        Add Session
      </Button>
      <Button
        variant="secondary"
        size="sm"
        leftIcon="calendar"
        onClick={onEditSchedule}
      >
        Edit Schedule
      </Button>
      <Button
        variant="secondary"
        size="sm"
        leftIcon="calendar-x"
        onClick={onBlockDates}
      >
        Block Dates
      </Button>
    </div>
  );
}
