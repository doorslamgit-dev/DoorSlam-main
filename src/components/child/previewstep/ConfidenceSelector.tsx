// src/components/child/previewstep/ConfidenceSelector.tsx

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";
import { ConfidenceLevel } from "../../../types/child/previewstep";
import {
  CONFIDENCE_OPTIONS,
  getIconColorForConfidence,
} from "../../../services/child/previewstep";

interface ConfidenceSelectorProps {
  selected: ConfidenceLevel | null;
  onSelect: (level: ConfidenceLevel) => void;
  disabled: boolean;
}

export function ConfidenceSelector({
  selected,
  onSelect,
  disabled,
}: ConfidenceSelectorProps) {
  return (
    <div className="space-y-3">
      {CONFIDENCE_OPTIONS.map((option) => {
        const isSelected = selected === option.id;
        const iconName = option.icon as IconKey;

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
                : "bg-neutral-50 border-neutral-200 hover:border-primary-300"
            }`}
          >
            {/* Icon */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                isSelected ? option.iconBgColor : "bg-neutral-200"
              }`}
            >
              <AppIcon
                name={iconName}
                className={`text-xl ${
                  isSelected ? option.iconColor : "text-neutral-500"
                }`}
              />
            </div>

            {/* Text */}
            <div className="flex-1 text-left">
              <p className="font-bold text-neutral-900 mb-0.5">
                {option.label}
              </p>
              <p className="text-neutral-600 text-sm">
                {option.description}
              </p>
            </div>

            {/* Selected indicator */}
            {isSelected && (
              <AppIcon
                name="checkCircle"
                className={`text-xl ${getIconColorForConfidence(option.id)}`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
