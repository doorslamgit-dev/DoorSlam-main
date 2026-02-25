// src/components/child/previewstep/TopicHeader.tsx

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

export interface TopicHeaderProps {
  subjectName: string;
  topicName: string;
  subjectIcon: IconKey | string;
  /** CSS class like "bg-info" or inline color like "#5B2CFF" */
  subjectColor?: string;
  /** @deprecated Use subjectColor instead */
  subjectColorClass?: string;
  sessionMinutes: number;
  totalSteps: number;
}

export function TopicHeader({
  subjectName,
  topicName,
  subjectIcon,
  subjectColor,
  subjectColorClass,
  sessionMinutes,
  totalSteps,
}: TopicHeaderProps) {
  // Support both CSS class and inline color
  const colorValue = subjectColor || subjectColorClass;
  const isInlineColor = colorValue?.startsWith("#") || colorValue?.startsWith("rgb");

  return (
    <div className="bg-background rounded-2xl shadow-sm p-6">
      <div className="flex items-center space-x-4">
        <div
          className={`w-16 h-16 rounded-xl flex items-center justify-center ${isInlineColor ? "" : colorValue || "bg-primary"}`}
          style={isInlineColor ? { backgroundColor: colorValue } : undefined}
        >
          <AppIcon name={subjectIcon} className="text-primary-foreground text-2xl" />
        </div>

        <div className="flex-1">
          <p className="text-muted-foreground text-sm mb-1">{subjectName}</p>
          <h1 className="text-2xl font-bold text-primary">{topicName}</h1>
        </div>
      </div>

      <div className="flex items-center space-x-4 mt-6">
        <div className="flex items-center space-x-2 bg-primary/5 px-4 py-2 rounded-full">
          <AppIcon name="clock" className="text-primary" />
          <span className="text-primary font-semibold text-sm">
            ~{sessionMinutes} minutes
          </span>
        </div>

        <div className="flex items-center space-x-2 bg-secondary px-4 py-2 rounded-full">
          <AppIcon name="list-check" className="text-muted-foreground" />
          <span className="text-foreground font-semibold text-sm">
            {totalSteps} steps
          </span>
        </div>
      </div>
    </div>
  );
}
