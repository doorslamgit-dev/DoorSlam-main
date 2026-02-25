// src/components/subjects/SubjectProgressHeader.tsx

import AppIcon from "../ui/AppIcon";
import { getStatusUI, type StatusIndicator } from "../../utils/statusStyles";

interface SubjectProgressHeaderProps {
  totalSubjects: number;
  childStatus: string;
  childStatusLabel: string;
  headline: string;
  message: string;
  onDashboardClick: () => void;
  onScheduleClick: () => void;
  onAddSubject: () => void;
}

function safeStatusIndicator(value: unknown): StatusIndicator {
  if (
    value === "on_track" ||
    value === "keep_an_eye" ||
    value === "needs_attention" ||
    value === "getting_started"
  ) {
    return value;
  }
  return "on_track";
}

export function SubjectProgressHeader({
  totalSubjects,
  childStatus,
  childStatusLabel,
  headline,
  message,
  onDashboardClick,
  onScheduleClick,
  onAddSubject,
}: SubjectProgressHeaderProps) {
  const status = safeStatusIndicator(childStatus);
  const ui = getStatusUI(status);

  return (
    <div className="bg-gradient-to-br from-primary/5 to-white rounded-2xl shadow-sm p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            {headline}
          </h1>

          {totalSubjects > 0 && (
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${ui.badgeClass}`}
            >
              <AppIcon name={ui.icon} className="w-4 h-4" />
              {childStatusLabel}
            </span>
          )}
        </div>

        <p className="text-muted-foreground max-w-xl">{message}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onDashboardClick}
          className="px-6 py-3 bg-primary-600 text-white font-medium rounded-full hover:bg-primary-700 transition-colors shadow-sm"
        >
          Back to Dashboard
        </button>

        <button
          type="button"
          onClick={onScheduleClick}
          className="px-6 py-3 bg-neutral-0 text-primary-600 font-medium rounded-full border-2 border-primary-200 hover:border-primary-300 transition-colors"
        >
          View Schedule
        </button>

        <button
          type="button"
          onClick={onAddSubject}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-neutral-0 text-primary-600 font-medium rounded-full border border-neutral-200 hover:border-primary-300 transition-colors shadow-sm"
        >
          <AppIcon name="plus" className="w-4 h-4" />
          Add Subject
        </button>
      </div>
    </div>
  );
}
