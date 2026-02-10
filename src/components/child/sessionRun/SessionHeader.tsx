// src/components/child/sessionRun/SessionHeader.tsx
// Header component for session runner

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

export type SessionHeaderProps = {
  subjectName: string;
  subjectIcon: IconKey | string;
  /** CSS class like "bg-subject-maths" or inline color like "#5B2CFF" */
  subjectColor?: string;
  /** @deprecated Use subjectColor instead */
  subjectColorClass?: string;
  topicName: string;
  onExit: () => void;
};

export default function SessionHeader({
  subjectName,
  subjectIcon,
  subjectColor,
  subjectColorClass,
  topicName,
  onExit,
}: SessionHeaderProps) {
  // Support both CSS class and inline color
  const colorValue = subjectColor || subjectColorClass;
  const isInlineColor = colorValue?.startsWith("#") || colorValue?.startsWith("rgb");

  return (
    <header className="bg-neutral-0 border-b border-neutral-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${isInlineColor ? "" : colorValue || "bg-primary-500"}`}
            style={isInlineColor ? { backgroundColor: colorValue } : undefined}
            aria-hidden="true"
          >
            <AppIcon name={subjectIcon} className="w-5 h-5 text-white" />
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-primary-900">{subjectName}</p>
            <p className="text-neutral-500 text-sm truncate max-w-[200px]">
              {topicName}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition"
        >
          <AppIcon name="close" aria-hidden />
          <span className="font-medium">Exit session</span>
        </button>
      </div>
    </header>
  );
}
