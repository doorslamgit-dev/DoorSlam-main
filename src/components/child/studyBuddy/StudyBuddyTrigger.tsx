// src/components/child/studyBuddy/StudyBuddyTrigger.tsx

import React from "react";
import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

interface StudyBuddyTriggerProps {
  onClick: (e: React.MouseEvent) => void;
  promptText?: string;
  variant?: "inline" | "floating" | "compact";
  disabled?: boolean;
}

const ROBOT_ICON: IconKey = "robot";
const QUESTION_ICON: IconKey = "question";

export const StudyBuddyTrigger: React.FC<StudyBuddyTriggerProps> = ({
  onClick,
  promptText = "Ask Study Buddy",
  variant = "inline",
  disabled = false,
}) => {
  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label="Ask Study Buddy"
        title="Ask Study Buddy for help"
        className="text-primary-600 hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <AppIcon name={QUESTION_ICON} />
      </button>
    );
  }

  if (variant === "floating") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="fixed bottom-20 right-4 z-40 bg-primary-100 text-primary-700 px-4 py-2 rounded-full shadow-md hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
      >
        <AppIcon name={ROBOT_ICON} />
        <span className="text-sm font-medium">Need help?</span>
      </button>
    );
  }

  // Default inline variant
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
    >
      <AppIcon name={ROBOT_ICON} />
      <span>{promptText}</span>
    </button>
  );
};

export default StudyBuddyTrigger;
