// src/components/ui/Badge.tsx
/**
 * Badge Component
 * ===============
 * Small status indicators, labels, and tags.
 *
 * VARIANTS (color schemes):
 * - default: Neutral gray
 * - primary: Brand purple
 * - success: Green (completed, on track)
 * - warning: Amber (needs attention)
 * - danger: Red (behind, error)
 * - info: Blue (informational)
 *
 * SIZES:
 * - sm: Compact (px-2 py-0.5, text-xs)
 * - md: Default (px-2.5 py-1, text-xs)
 * - lg: Larger (px-3 py-1.5, text-sm)
 *
 * STYLES:
 * - solid: Filled background (default)
 * - soft: Light background with darker text
 * - outline: Border only, no fill
 *
 * FEATURES:
 * - Optional icon (left side)
 * - Dot indicator option
 * - Pill shape (fully rounded)
 *
 * USAGE:
 * ```tsx
 * // Simple status badge
 * <Badge variant="success">On Track</Badge>
 *
 * // With icon
 * <Badge variant="warning" icon="clock">Pending</Badge>
 *
 * // Outline style
 * <Badge variant="primary" style="outline">New</Badge>
 *
 * // With dot indicator
 * <Badge variant="success" dot>Active</Badge>
 *
 * // Status mapping
 * <Badge variant={STATUS_TO_VARIANT[status]}>{statusLabel}</Badge>
 * ```
 */

import { type HTMLAttributes, type ReactNode, forwardRef } from "react";
import AppIcon from "./AppIcon";
import type { IconKey } from "./AppIcon";

// ============================================================================
// TYPES
// ============================================================================

export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type BadgeSize = "sm" | "md" | "lg";
export type BadgeStyle = "solid" | "soft" | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Color variant */
  variant?: BadgeVariant;
  /** Size preset */
  size?: BadgeSize;
  /** Visual style */
  badgeStyle?: BadgeStyle;
  /** Icon to show on left */
  icon?: IconKey;
  /** Show dot indicator instead of/before text */
  dot?: boolean;
  /** Badge content */
  children: ReactNode;
}

// ============================================================================
// STYLE MAPPINGS
// ============================================================================

/**
 * Solid variant colors (filled background)
 */
const solidStyles: Record<BadgeVariant, string> = {
  default: "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200",
  primary: "bg-primary-600 text-white",
  success: "bg-accent-green text-white",
  warning: "bg-accent-amber text-white",
  danger: "bg-accent-red text-white",
  info: "bg-accent-blue text-white",
};

/**
 * Soft variant colors (light background, darker text)
 */
const softStyles: Record<BadgeVariant, string> = {
  default: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  primary: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
  success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
};

/**
 * Outline variant colors (border only)
 */
const outlineStyles: Record<BadgeVariant, string> = {
  default: "border border-neutral-300 text-neutral-600 dark:border-neutral-600 dark:text-neutral-300",
  primary: "border border-primary-300 text-primary-600 dark:border-primary-600 dark:text-primary-400",
  success: "border border-green-300 text-green-600 dark:border-green-600 dark:text-green-400",
  warning: "border border-amber-300 text-amber-600 dark:border-amber-600 dark:text-amber-400",
  danger: "border border-red-300 text-red-600 dark:border-red-600 dark:text-red-400",
  info: "border border-blue-300 text-blue-600 dark:border-blue-600 dark:text-blue-400",
};

/**
 * Style map selector
 */
const styleMap: Record<BadgeStyle, Record<BadgeVariant, string>> = {
  solid: solidStyles,
  soft: softStyles,
  outline: outlineStyles,
};

/**
 * Size styles
 */
const sizeStyles: Record<BadgeSize, { badge: string; icon: string; dot: string }> = {
  sm: { badge: "px-2 py-0.5 text-xs gap-1", icon: "w-3 h-3", dot: "w-1.5 h-1.5" },
  md: { badge: "px-2.5 py-1 text-xs gap-1.5", icon: "w-3.5 h-3.5", dot: "w-2 h-2" },
  lg: { badge: "px-3 py-1.5 text-sm gap-1.5", icon: "w-4 h-4", dot: "w-2 h-2" },
};

/**
 * Dot colors per variant
 */
const dotColors: Record<BadgeVariant, string> = {
  default: "bg-neutral-500",
  primary: "bg-primary-500",
  success: "bg-accent-green",
  warning: "bg-accent-amber",
  danger: "bg-accent-red",
  info: "bg-accent-blue",
};

// ============================================================================
// COMPONENT
// ============================================================================

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = "default",
      size = "md",
      badgeStyle = "soft",
      icon,
      dot = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const sizes = sizeStyles[size];
    const variantStyle = styleMap[badgeStyle][variant];

    const classes = [
      "inline-flex items-center font-medium rounded-full",
      sizes.badge,
      variantStyle,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span ref={ref} className={classes} {...props}>
        {/* Dot indicator */}
        {dot && (
          <span
            className={`${sizes.dot} rounded-full ${dotColors[variant]}`}
            aria-hidden="true"
          />
        )}

        {/* Icon */}
        {icon && !dot && <AppIcon name={icon} className={sizes.icon} />}

        {/* Content */}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

// ============================================================================
// HELPER: Status to variant mapping
// ============================================================================

/**
 * Common status strings mapped to badge variants
 * Use for consistent status badge rendering
 */
export const STATUS_TO_BADGE_VARIANT: Record<string, BadgeVariant> = {
  // Session/progress status
  on_track: "success",
  completed: "success",
  complete: "success",
  active: "success",
  approved: "success",

  // Warning states
  needs_attention: "warning",
  pending: "warning",
  in_progress: "warning",
  waiting: "warning",

  // Error states
  behind: "danger",
  declined: "danger",
  failed: "danger",
  error: "danger",

  // Neutral states
  not_started: "default",
  inactive: "default",
  draft: "default",
};

export default Badge;
