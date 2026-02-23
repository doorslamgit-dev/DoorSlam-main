// src/components/ui/Select.tsx
/**
 * Select / Dropdown Component
 * ===========================
 * Styled native <select> with consistent styling matching FormField.
 *
 * FEATURES:
 * - Styled native select with custom chevron icon
 * - Consistent border, radius, and focus ring (matches FormField)
 * - Label, error, and helper text support
 * - Two sizes: sm (compact) and md (default)
 * - Design tokens for all colours
 * - Dark mode support
 *
 * USAGE:
 * ```tsx
 * <Select
 *   label="Time"
 *   options={[
 *     { value: 'morning', label: 'Morning' },
 *     { value: 'afternoon', label: 'Afternoon' },
 *   ]}
 *   value={time}
 *   onChange={setTime}
 * />
 * ```
 */

import { forwardRef } from "react";
import AppIcon from "./AppIcon";

// ============================================================================
// TYPES
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type SelectSize = "sm" | "md";

export interface SelectProps {
  /** Available options */
  options: SelectOption[];
  /** Currently selected value */
  value: string;
  /** Called when selection changes */
  onChange: (value: string) => void;
  /** Placeholder text (renders as disabled first option) */
  placeholder?: string;
  /** Field label */
  label?: string;
  /** Error message (shows error state if provided) */
  error?: string;
  /** Helper text below the select */
  helperText?: string;
  /** Size preset */
  size?: SelectSize;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Additional className for the wrapper */
  className?: string;
  /** HTML name attribute */
  name?: string;
  /** HTML id attribute */
  id?: string;
}

// ============================================================================
// STYLE CONSTANTS
// ============================================================================

const sizeStyles: Record<SelectSize, string> = {
  sm: "py-2 px-3 pr-8 text-sm",
  md: "py-3 px-4 pr-10 text-sm",
};

const iconSizes: Record<SelectSize, { className: string; right: string }> = {
  sm: { className: "w-3.5 h-3.5", right: "right-2.5" },
  md: { className: "w-4 h-4", right: "right-3" },
};

const labelStyles = "block text-sm font-medium mb-2 text-neutral-700";

// ============================================================================
// COMPONENT
// ============================================================================

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder,
      label,
      error,
      helperText,
      size = "md",
      disabled = false,
      className = "",
      name,
      id,
    },
    ref
  ) => {
    const selectId = id || name;

    const selectClasses = [
      "w-full appearance-none",
      "border rounded-xl",
      "bg-neutral-0",
      "text-neutral-900",
      "transition-all duration-150",
      "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
      "disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed",
      sizeStyles[size],
      error
        ? "border-danger focus:ring-danger"
        : "border-neutral-300",
    ].join(" ");

    return (
      <div className={className}>
        {label && (
          <label htmlFor={selectId} className={labelStyles}>
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={selectClasses}
            aria-invalid={error ? "true" : undefined}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <div
            className={`absolute ${iconSizes[size].right} top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400`}
          >
            <AppIcon
              name="chevron-down"
              className={iconSizes[size].className}
            />
          </div>
        </div>

        {(error || helperText) && (
          <p
            className={`mt-1.5 text-sm ${
              error ? "text-danger" : "text-neutral-500"
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
