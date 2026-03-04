// src/components/child/session/ConfidenceSelector.tsx
// Shared confidence selector — supports "list" (preview) and "grid" (complete) variants

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

export interface ConfidenceSelectorOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  /** Unselected bg for grid; selected bg for list */
  bgColor: string;
  selectedBorder: string;
  // List variant:
  iconBgColor?: string;
  iconColor?: string;
  // Grid variant:
  selectedBg?: string;
}

interface ConfidenceSelectorProps {
  options: ConfidenceSelectorOption[];
  selected: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
  variant: "list" | "grid";
}

export function ConfidenceSelector({
  options,
  selected,
  onSelect,
  disabled = false,
  variant,
}: ConfidenceSelectorProps) {
  if (variant === "list") {
    return (
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selected === option.id;
          const checkColor = option.selectedBorder.replace("border-", "text-");

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              disabled={disabled}
              className={`w-full p-4 rounded-xl border-2 transition flex items-center space-x-4 ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
              } ${
                isSelected
                  ? `${option.bgColor} ${option.selectedBorder}`
                  : "bg-muted border-border hover:border-primary/50"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isSelected ? (option.iconBgColor ?? "bg-primary") : "bg-secondary"
                }`}
              >
                <AppIcon
                  name={option.icon as IconKey}
                  className={`text-xl ${
                    isSelected ? (option.iconColor ?? "text-white") : "text-muted-foreground"
                  }`}
                  aria-hidden
                />
              </div>

              <div className="flex-1 text-left">
                <p className="font-bold text-foreground mb-0.5">{option.label}</p>
                <p className="text-muted-foreground text-sm">{option.description}</p>
              </div>

              {isSelected && (
                <AppIcon name={"checkCircle" as IconKey} className={`text-xl ${checkColor}`} aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Grid variant
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option) => {
        const isSelected = selected === option.id;
        const checkColor = option.selectedBorder.replace("border-", "text-");

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            disabled={disabled}
            className={`p-4 rounded-xl border-2 transition text-left ${
              isSelected
                ? `${option.selectedBg ?? option.bgColor} ${option.selectedBorder}`
                : `${option.bgColor} border-border hover:border-input`
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <AppIcon name={option.icon as IconKey} className="w-6 h-6 flex-shrink-0" aria-hidden />
              <span className="font-semibold text-foreground">{option.label}</span>
              {isSelected && (
                <AppIcon name={"checkCircle" as IconKey} className={`ml-auto ${checkColor}`} aria-hidden />
              )}
            </div>
            <p className="text-muted-foreground text-sm">{option.description}</p>
          </button>
        );
      })}
    </div>
  );
}
