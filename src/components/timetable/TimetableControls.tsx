import AppIcon from "../ui/AppIcon";
import { formatDateRange } from "../../services/timetableService";
import type { ViewMode } from "../../hooks/useTimetableData";

interface TimetableControlsProps {
  viewMode: ViewMode;
  referenceDate: Date;
  onPrevious: () => void;
  onNext: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onTodayClick: () => void;
}

export function TimetableControls({
  viewMode,
  referenceDate,
  onPrevious,
  onNext,
  onViewModeChange,
  onTodayClick,
}: TimetableControlsProps) {
  const handleViewModeClick = (mode: ViewMode) => {
    onViewModeChange(mode);
    if (mode === "today") {
      onTodayClick();
    }
  };

  return (
    <div className="bg-neutral-0 rounded-2xl shadow-soft p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onPrevious}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <AppIcon
              name="chevron-left"
              className="w-4 h-4 text-neutral-600"
            />
          </button>
          <h3 className="text-lg font-semibold min-w-[200px] text-center text-neutral-700">
            {formatDateRange(viewMode, referenceDate)}
          </h3>
          <button
            onClick={onNext}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <AppIcon
              name="chevron-right"
              className="w-4 h-4 text-neutral-600"
            />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          {(["today", "week", "month"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => handleViewModeClick(mode)}
              className={`px-4 py-2 border rounded-full text-sm transition-colors ${
                viewMode === mode
                  ? "bg-primary-50 border-primary-600 text-primary-600"
                  : "bg-neutral-0 border-neutral-200 text-neutral-600"
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
