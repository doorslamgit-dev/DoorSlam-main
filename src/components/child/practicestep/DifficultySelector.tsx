// src/components/child/practicestep/DifficultySelector.tsx

import { DifficultyLevel, QuestionCounts } from "../../../types/child/practicestep";
import { DIFFICULTY_OPTIONS } from "../../../services/child/practicestep";
import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

interface DifficultySelectorProps {
  selected: DifficultyLevel;
  onChange: (level: DifficultyLevel) => void;
  questionCounts: QuestionCounts;
}

export function DifficultySelector({
  selected,
  onChange,
  questionCounts,
}: DifficultySelectorProps) {
  return (
    <div className="bg-background rounded-xl p-4 shadow-sm border border-border">
      <p className="text-sm text-muted-foreground mb-3 text-center">Choose your challenge level:</p>
      <div className="flex gap-2 justify-center">
        {DIFFICULTY_OPTIONS.map((opt) => {
          const count = questionCounts[opt.value];
          const isSelected = selected === opt.value;
          const isDisabled = count === 0;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => !isDisabled && onChange(opt.value)}
              disabled={isDisabled}
              className={`
                flex-1 max-w-[120px] py-3 px-4 rounded-xl border-2 transition-all
                ${isSelected ? `${opt.color} border-current font-semibold` : "bg-background border-border text-muted-foreground"}
                ${isDisabled ? "opacity-40 cursor-not-allowed" : "hover:border-input cursor-pointer"}
              `}
            >
              <div className="flex justify-center mb-1">
                <AppIcon name={opt.icon as IconKey} className="w-5 h-5" aria-hidden />
              </div>
              <div className="text-sm font-medium">{opt.label}</div>
              {count > 0 && (
                <div className="text-xs opacity-70">{count} Q{count > 1 ? "s" : ""}</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
