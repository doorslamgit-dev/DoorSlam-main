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
    <div className="bg-neutral-0 rounded-2xl shadow-soft p-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Date Navigation */}
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

        {/* Right side: Subject Legend + View Mode */}
        <div className="flex items-center gap-6">
          {/* Subject Legend (inline) */}
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
                  <span className="text-xs text-neutral-500">
                    {subject.subject_name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* View Mode Toggle */}
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
    </div>
  );
}
