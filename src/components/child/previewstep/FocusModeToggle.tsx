// src/components/child/previewstep/FocusModeToggle.tsx

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

interface FocusModeToggleProps {
  isActive: boolean;
  onToggle: () => void;
  disabled: boolean;
}

export function FocusModeToggle({ isActive, onToggle, disabled }: FocusModeToggleProps) {
  const icon: IconKey = "mobile";

  return (
    <div
      onClick={disabled ? undefined : onToggle}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      aria-disabled={disabled}
      className={`w-full p-4 rounded-xl border-2 transition flex items-center space-x-4 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${
        isActive
          ? "bg-accent-green/10 border-accent-green"
          : "bg-neutral-50 border-neutral-200 hover:border-primary-300"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
          isActive ? "bg-accent-green" : "bg-neutral-200"
        }`}
      >
        <AppIcon
          name={icon}
          className={`text-xl ${isActive ? "text-white" : "text-neutral-500"}`}
        />
      </div>

      <div className="flex-1 text-left">
        <p className="font-bold text-neutral-900 mb-0.5">Focus Mode</p>
        <p className="text-neutral-600 text-sm">
          I've logged out of social media apps, such as TikTok, Snapchat, Instagram...
        </p>
        {isActive && (
          <p className="text-neutral-700 font-medium text-sm mt-2">
            +5 bonus points for focused revision!
          </p>
        )}
      </div>

      <div
        className={`relative w-14 h-8 rounded-full transition-colors flex-shrink-0 ${
          isActive ? "bg-accent-green" : "bg-neutral-300"
        }`}
      >
        <span
          className={`absolute top-1 w-6 h-6 bg-neutral-0 rounded-full shadow transition-transform ${
            isActive ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </div>
    </div>
  );
}
