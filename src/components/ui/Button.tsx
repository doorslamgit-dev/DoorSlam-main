// src/components/ui/Button.tsx
/**
 * Button Component
 * ================
 * A consistent, accessible button component with multiple variants.
 *
 * VARIANTS:
 * - primary: Main CTA buttons (purple background, white text)
 * - secondary: Secondary actions (white/gray background, dark text)
 * - ghost: Minimal style for tertiary actions (transparent, no border)
 * - danger: Destructive actions (red styling)
 *
 * SIZES:
 * - sm: Compact buttons for tight spaces (py-2 px-3)
 * - md: Default size for most uses (py-2.5 px-4)
 * - lg: Prominent CTAs (py-3 px-6)
 *
 * FEATURES:
 * - Loading state with spinner
 * - Icon support (left or right)
 * - Full width option
 * - Disabled state styling
 * - Consistent focus rings for accessibility
 *
 * USAGE:
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Save Changes
 * </Button>
 *
 * <Button variant="secondary" leftIcon="arrow-left" onClick={goBack}>
 *   Back
 * </Button>
 *
 * <Button variant="primary" loading>
 *   Saving...
 * </Button>
 * ```
 */

import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from "react";
import AppIcon from "./AppIcon";
import type { IconKey } from "./AppIcon";

// ============================================================================
// TYPES
// ============================================================================

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Shows loading spinner and disables button */
  loading?: boolean;
  /** Icon to show on the left */
  leftIcon?: IconKey;
  /** Icon to show on the right */
  rightIcon?: IconKey;
  /** Makes button full width */
  fullWidth?: boolean;
  /** Button content */
  children: ReactNode;
}

// ============================================================================
// STYLE MAPPINGS
// ============================================================================

/**
 * Variant styles define the visual appearance
 * All use design tokens from themes.css via Tailwind
 */
const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    "bg-primary-600 text-white",
    "hover:bg-primary-700",
    "focus:ring-primary-500",
    "disabled:bg-primary-300",
  ].join(" "),

  secondary: [
    "bg-neutral-100 text-neutral-700 border border-neutral-200",
    "hover:bg-neutral-200 hover:border-neutral-300",
    "focus:ring-neutral-400",
    "disabled:bg-neutral-50 disabled:text-neutral-400",
  ].join(" "),

  ghost: [
    "bg-transparent text-neutral-600",
    "hover:bg-neutral-100 hover:text-neutral-700",
    "focus:ring-neutral-400",
    "disabled:text-neutral-400",
  ].join(" "),

  danger: [
    "bg-accent-red text-white",
    "hover:bg-red-600",
    "focus:ring-red-500",
    "disabled:bg-red-300",
  ].join(" "),
};

/**
 * Size styles define padding and text size
 * Uses consistent spacing scale
 */
const sizeStyles: Record<ButtonSize, string> = {
  sm: "py-2 px-3 text-sm gap-1.5",
  md: "py-2.5 px-4 text-sm gap-2",
  lg: "py-3 px-6 text-base gap-2",
};

/**
 * Icon sizes matched to button sizes
 */
const iconSizes: Record<ButtonSize, string> = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

// ============================================================================
// COMPONENT
// ============================================================================

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseStyles = [
      // Layout
      "inline-flex items-center justify-center",
      // Typography
      "font-semibold",
      // Shape
      "rounded-xl",
      // Transitions
      "transition-colors duration-150",
      // Focus state (accessibility)
      "focus:outline-none focus:ring-2 focus:ring-offset-2",
      // Disabled state
      "disabled:cursor-not-allowed",
    ].join(" ");

    const classes = [
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      fullWidth ? "w-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={classes}
        {...props}
      >
        {/* Loading spinner replaces left icon */}
        {loading ? (
          <span className={`${iconSizes[size]} animate-spin`}>
            <svg
              className="w-full h-full"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        ) : leftIcon ? (
          <AppIcon name={leftIcon} className={iconSizes[size]} />
        ) : null}

        {children}

        {/* Right icon (not shown when loading) */}
        {!loading && rightIcon && (
          <AppIcon name={rightIcon} className={iconSizes[size]} />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
