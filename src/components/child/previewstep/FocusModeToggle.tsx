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
          ? "bg-success/10 border-success"
          : "bg-muted border-border hover:border-primary/50"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
          isActive ? "bg-success" : "bg-secondary"
        }`}
      >
        <AppIcon
          name={icon}
          className={`text-xl ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
        />
      </div>

      <div className="flex-1 text-left">
        <p className="font-bold text-foreground mb-0.5">Focus Mode</p>
        <p className="text-muted-foreground text-sm">
          I've logged out of social media apps, such as TikTok, Snapchat, Instagram...
        </p>
        {isActive && (
          <p className="text-foreground font-medium text-sm mt-2">
            +5 bonus points for focused revision!
          </p>
        )}
      </div>

      <div
        className={`relative w-14 h-8 rounded-full transition-colors flex-shrink-0 ${
          isActive ? "bg-success" : "bg-muted-foreground"
        }`}
      >
        <span
          className={`absolute top-1 w-6 h-6 bg-background rounded-full shadow transition-transform ${
            isActive ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </div>
    </div>
  );
}
