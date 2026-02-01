// src/components/child/completestep/ConfidenceSelector.tsx

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";
import { ConfidenceLevel } from "../../../types/child/completestep";
import { CONFIDENCE_OPTIONS } from "../../../services/child/completestep";

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
  const selectedIcon: IconKey = "checkCircle";

  return (
    <div className="grid grid-cols-2 gap-3">
      {CONFIDENCE_OPTIONS.map((option) => {
        const isSelected = selected === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            disabled={disabled}
            className={`p-4 rounded-xl border-2 transition text-left ${
              isSelected
                ? `${option.selectedBg} ${option.selectedBorder}`
                : `${option.bgColor} border-neutral-200 hover:border-neutral-300`
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{option.emoji}</span>
              <span className="font-semibold text-neutral-900">{option.label}</span>

              {isSelected && (
                <AppIcon
                  name={selectedIcon}
                  className="ml-auto text-success"
                  aria-hidden
                />
              )}
            </div>

            <p className="text-neutral-500 text-sm">{option.description}</p>
          </button>
        );
      })}
    </div>
  );
}
