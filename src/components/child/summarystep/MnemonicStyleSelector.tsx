// src/components/child/summarystep/MnemonicStyleSelector.tsx

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";
import { MnemonicStyle } from "../../../types/child/summarystep";
import { MNEMONIC_STYLES } from "../../../services/child/summarystep";

interface MnemonicStyleSelectorProps {
  selectedStyle: MnemonicStyle | null;
  onSelect: (style: MnemonicStyle) => void;
  disabled: boolean;
}

export function MnemonicStyleSelector({
  selectedStyle,
  onSelect,
  disabled,
}: MnemonicStyleSelectorProps) {
  return (
    <div
      className="grid grid-cols-3 gap-3"
      role="group"
      aria-label="Mnemonic style"
    >
      {MNEMONIC_STYLES.map((style) => {
        const isSelected = selectedStyle === style.id;

        return (
          <button
            key={style.id}
            type="button"
            disabled={disabled}
            aria-pressed={isSelected}
            onClick={() => {
              if (!disabled) {
                onSelect(style.id);
              }
            }}
            className={[
              "flex flex-col items-center p-4 rounded-xl border-2 transition",
              isSelected
                ? "bg-primary-50 border-primary-600"
                : "bg-neutral-50 border-transparent hover:border-primary-300",
              disabled ? "opacity-50 cursor-not-allowed" : "",
            ].join(" ")}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-gradient-to-br ${style.gradient}`}
            >
              <AppIcon name={style.icon as IconKey} className="text-white w-5 h-5" />
            </div>

            <span className="font-semibold text-neutral-700 text-sm">
              {style.name}
            </span>

            <span className="text-neutral-500 text-xs text-center">
              {style.description}
            </span>

            {isSelected && (
              <div className="mt-2 text-primary-600">
                <AppIcon name="check" className="w-4 h-4" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
