// src/components/subjects/SubjectProgressHeader.tsx

import AppIcon from "../ui/AppIcon";
import type { ChildOption } from "../../types/subjectProgress";
import { getStatusUI, type StatusIndicator } from "../../utils/statusStyles";

interface SubjectProgressHeaderProps {
  /**
   * NOTE: This is intentionally named `children` because that’s what your page is
   * already passing in. Internally we alias it to `childOptions` to avoid
   * confusion with React’s conventional `children` prop.
   */
  children: ChildOption[];
  selectedChildId: string | null;
  totalSubjects: number;
  childStatus: string;
  childStatusLabel: string;
  headline: string;
  message: string;
  onChildChange: (childId: string) => void;
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
  children: childOptions,
  selectedChildId,
  totalSubjects,
  childStatus,
  childStatusLabel,
  headline,
  message,
  onChildChange,
  onDashboardClick,
  onScheduleClick,
  onAddSubject,
}: SubjectProgressHeaderProps) {
  const status = safeStatusIndicator(childStatus);
  const ui = getStatusUI(status);

  const hasMultipleChildren = childOptions.length > 1;

  return (
    <div className="bg-gradient-to-br from-primary/5 to-white rounded-2xl shadow-sm p-8">
      {/* Header with title and child selector */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div className="flex-1">
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

        {/* Child Selector */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-muted-foreground">Child:</span>

          <div className="relative flex items-center px-4 py-2 rounded-full border bg-background border-primary/20 shadow-sm">
            <select
              value={selectedChildId || ""}
              onChange={(e) => onChildChange(e.target.value)}
              disabled={!hasMultipleChildren}
              className="appearance-none bg-transparent border-none font-medium focus:outline-none cursor-pointer pr-6 text-primary disabled:cursor-default disabled:opacity-80"
              aria-label="Select child"
            >
              {childOptions.map((child) => (
                <option key={child.child_id} value={child.child_id}>
                  {child.child_name}
                </option>
              ))}
            </select>

            {hasMultipleChildren && (
              <span className="absolute right-4 pointer-events-none text-primary">
                <AppIcon name="chevron-down" className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onDashboardClick}
          className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors shadow-sm"
        >
          Back to Dashboard
        </button>

        <button
          type="button"
          onClick={onScheduleClick}
          className="px-6 py-3 bg-background text-primary font-medium rounded-full border-2 border-primary/20 hover:border-primary/50 transition-colors"
        >
          View Schedule
        </button>

        <button
          type="button"
          onClick={onAddSubject}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-background text-primary font-medium rounded-full border border-border hover:border-primary/50 transition-colors shadow-sm"
        >
          <AppIcon name="plus" className="w-4 h-4" />
          Add Subject
        </button>
      </div>
    </div>
  );
}
