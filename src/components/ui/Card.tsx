// src/components/ui/Card.tsx
/**
 * Card Component
 * ==============
 * A flexible container component for grouping related content.
 *
 * VARIANTS:
 * - default: Standard card with subtle shadow (most common)
 * - elevated: Prominent card with larger shadow (for CTAs, featured items)
 * - outlined: Border only, no shadow (for lists, secondary content)
 * - flat: No shadow or border (for subtle grouping)
 *
 * PADDING:
 * - none: No padding (for custom layouts)
 * - sm: Compact padding (p-4)
 * - md: Standard padding (p-6) - default
 * - lg: Spacious padding (p-8)
 *
 * FEATURES:
 * - Optional header with title and actions
 * - Dark mode support
 * - Interactive variant (hover state)
 * - Consistent border radius (rounded-2xl)
 *
 * USAGE:
 * ```tsx
 * // Simple card
 * <Card>
 *   <p>Card content here</p>
 * </Card>
 *
 * // Card with header
 * <Card
 *   title="Settings"
 *   action={<Button size="sm">Edit</Button>}
 * >
 *   <p>Settings content</p>
 * </Card>
 *
 * // Clickable card
 * <Card variant="outlined" interactive onClick={handleClick}>
 *   <p>Click me</p>
 * </Card>
 * ```
 */

import { type HTMLAttributes, type ReactNode, forwardRef } from "react";

// ============================================================================
// TYPES
// ============================================================================

export type CardVariant = "default" | "elevated" | "outlined" | "flat";
export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual style variant */
  variant?: CardVariant;
  /** Internal padding */
  padding?: CardPadding;
  /** Card title (renders in header) */
  title?: string;
  /** Subtitle below title */
  subtitle?: string;
  /** Action element (renders in header, right side) */
  action?: ReactNode;
  /** Enables hover state for clickable cards */
  interactive?: boolean;
  /** Card content */
  children: ReactNode;
}

// ============================================================================
// STYLE MAPPINGS
// ============================================================================

/**
 * Variant styles define shadows and borders
 * Uses design tokens from themes.css
 */
const variantStyles: Record<CardVariant, string> = {
  default: [
    "bg-neutral-0",
    "shadow-card",
    "border border-neutral-100",
  ].join(" "),

  elevated: [
    "bg-neutral-0",
    "shadow-lg",
    "border border-neutral-100",
  ].join(" "),

  outlined: [
    "bg-neutral-0",
    "border-2 border-neutral-200",
  ].join(" "),

  flat: [
    "bg-neutral-50",
  ].join(" "),
};

/**
 * Interactive hover states per variant
 */
const interactiveStyles: Record<CardVariant, string> = {
  default: "hover:shadow-card-hover hover:border-neutral-200 cursor-pointer",
  elevated: "hover:shadow-xl cursor-pointer",
  outlined: "hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer",
  flat: "hover:bg-neutral-100 cursor-pointer",
};

/**
 * Padding presets using consistent spacing scale
 */
const paddingStyles: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

// ============================================================================
// COMPONENT
// ============================================================================

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "md",
      title,
      subtitle,
      action,
      interactive = false,
      className = "",
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    // If onClick is provided, assume interactive
    const isInteractive = interactive || !!onClick;

    const baseStyles = [
      "rounded-2xl",
      "transition-all duration-150",
    ].join(" ");

    const classes = [
      baseStyles,
      variantStyles[variant],
      isInteractive ? interactiveStyles[variant] : "",
      // Only apply padding to card if no header
      !title && paddingStyles[padding],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const hasHeader = title || action;

    return (
      <div
        ref={ref}
        className={classes}
        onClick={onClick}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        {...props}
      >
        {/* Header section */}
        {hasHeader && (
          <div
            className={`flex items-center justify-between ${
              paddingStyles[padding]
            } ${children ? "pb-0" : ""}`}
          >
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-neutral-900">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-neutral-500 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            {action && <div>{action}</div>}
          </div>
        )}

        {/* Content section */}
        {children && (
          <div className={hasHeader ? paddingStyles[padding] : ""}>
            {children}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
