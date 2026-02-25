import AppIcon from "../ui/AppIcon";
import { formatDateRange } from "../../services/timetableService";
import type { SubjectLegend as SubjectLegendType } from "../../services/timetableService";
import type { ViewMode } from "../../hooks/useTimetableData";
import { getSubjectColor } from "../../constants/colors";

interface TimetableControlsProps {
  viewMode: ViewMode;
  referenceDate: Date;
  onPrevious: () => void;
  onNext: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onTodayClick: () => void;
  subjectLegend?: SubjectLegendType[];
}

export function TimetableControls({
  viewMode,
  referenceDate,
  onPrevious,
  onNext,
  onViewModeChange,
  onTodayClick,
  subjectLegend = [],
}: TimetableControlsProps) {
  const handleViewModeClick = (mode: ViewMode) => {
    onViewModeChange(mode);
    if (mode === "today") {
      onTodayClick();
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      {/* Left: Date navigation + View mode toggle */}
      <div className="flex items-center gap-4">
        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevious}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
          >
            <AppIcon
              name="chevron-left"
              className="w-4 h-4 text-muted-foreground"
            />
          </button>
          <h3 className="text-base font-semibold min-w-[160px] text-center text-foreground">
            {formatDateRange(viewMode, referenceDate)}
          </h3>
          <button
            onClick={onNext}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
          >
            <AppIcon
              name="chevron-right"
              className="w-4 h-4 text-muted-foreground"
            />
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1">
          {(["today", "week", "month"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => handleViewModeClick(mode)}
              className={`px-3.5 py-1.5 border rounded-full text-sm font-medium transition-colors ${
                viewMode === mode
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-border text-muted-foreground hover:border-input"
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Subject Legend */}
      {subjectLegend.length > 0 && (
        <div className="hidden md:flex items-center gap-4">
          {subjectLegend.map((subject) => (
            <div
              key={subject.subject_id}
              className="flex items-center gap-1.5"
            >
              <div
                className="w-3 h-3 rounded"
                style={{
                  backgroundColor: getSubjectColor(subject.subject_name),
                }}
              />
              <span className="text-xs text-muted-foreground">
                {subject.subject_name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
