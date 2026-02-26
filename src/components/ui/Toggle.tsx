// src/components/ui/Toggle.tsx
/**
 * Toggle / Switch Component
 * =========================
 * Accessible toggle switch with optional label and description.
 *
 * FEATURES:
 * - Accessible: role="switch", aria-checked, keyboard toggle (Space/Enter)
 * - Design tokens only (no hardcoded colours)
 * - Dark mode support via token inversion
 * - Optional label + description layout
 * - Two sizes: sm (compact) and md (default)
 *
 * USAGE:
 * ```tsx
 * <Toggle checked={enabled} onChange={setEnabled} />
 *
 * <Toggle
 *   checked={notifications}
 *   onChange={setNotifications}
 *   label="Weekly summary"
 *   description="Get a summary every Monday"
 * />
 * ```
 */

import { useCallback, type KeyboardEvent } from "react";

// ============================================================================
// TYPES
// ============================================================================

export type ToggleSize = "sm" | "md";

export interface ToggleProps {
  /** Whether the toggle is on */
  checked: boolean;
  /** Called when the toggle value changes */
  onChange: (checked: boolean) => void;
  /** Optional label text */
  label?: string;
  /** Optional description below the label */
  description?: string;
  /** Size preset */
  size?: ToggleSize;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Additional className for the wrapper */
  className?: string;
}

// ============================================================================
// STYLE MAPPINGS
// ============================================================================

const trackSizes: Record<ToggleSize, string> = {
  sm: "w-9 h-5",
  md: "w-11 h-6",
};

const thumbSizes: Record<ToggleSize, { base: string; translate: string }> = {
  sm: { base: "w-4 h-4", translate: "translate-x-4" },
  md: { base: "w-5 h-5", translate: "translate-x-5" },
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function Toggle({
  checked,
  onChange,
  label,
  description,
  size = "md",
  disabled = false,
  className = "",
}: ToggleProps) {
  const handleClick = useCallback(() => {
    if (!disabled) onChange(!checked);
  }, [disabled, checked, onChange]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onChange(!checked);
      }
    },
    [disabled, checked, onChange]
  );

  const toggle = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={!label ? "Toggle" : undefined}
      tabIndex={0}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={[
        "relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200",
        trackSizes[size],
        checked ? "bg-primary" : "bg-muted",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "absolute top-[2px] left-[2px] rounded-full bg-background shadow transition-transform duration-200",
          thumbSizes[size].base,
          checked ? thumbSizes[size].translate : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );

  if (!label) {
    return <div className={className}>{toggle}</div>;
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {toggle}
    </div>
  );
}
