// src/components/ui/EmptyState.tsx
/**
 * EmptyState Component
 * ====================
 * Displays a centered message when there's no data to show.
 *
 * VARIANTS:
 * - default: Standard empty state with icon circle
 * - minimal: Simpler version without icon background
 * - card: Wrapped in a card container
 *
 * FEATURES:
 * - Icon with colored background circle
 * - Heading and description
 * - Optional action button
 * - Consistent layout across the app
 *
 * USAGE:
 * ```tsx
 * // Simple empty state
 * <EmptyState
 *   icon="inbox"
 *   title="No messages"
 *   description="You don't have any messages yet."
 * />
 *
 * // With action
 * <EmptyState
 *   icon="gift"
 *   title="No rewards"
 *   description="Browse the catalog to find rewards."
 *   action={
 *     <Button onClick={() => navigate('/catalog')}>
 *       Browse Catalog
 *     </Button>
 *   }
 * />
 *
 * // Card variant
 * <EmptyState
 *   variant="card"
 *   icon="calendar"
 *   title="No sessions"
 *   description="Schedule your first revision session."
 * />
 * ```
 */

import { type HTMLAttributes, type ReactNode, forwardRef } from "react";
import AppIcon from "./AppIcon";
import type { IconKey } from "./AppIcon";

// ============================================================================
// TYPES
// ============================================================================

export type EmptyStateVariant = "default" | "minimal" | "card";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: EmptyStateVariant;
  /** Icon to display */
  icon?: IconKey;
  /** Emoji alternative to icon */
  emoji?: string;
  /** Main heading */
  title: string;
  /** Description text */
  description?: string;
  /** Action element (usually a Button) */
  action?: ReactNode;
  /** Icon background color (Tailwind class) */
  iconBgColor?: string;
  /** Icon color (Tailwind class) */
  iconColor?: string;
}

// ============================================================================
// STYLE MAPPINGS
// ============================================================================

/**
 * Variant container styles
 */
const variantStyles: Record<EmptyStateVariant, string> = {
  default: "py-8",
  minimal: "py-6",
  card: "bg-neutral-0 rounded-2xl shadow-card p-8",
};

// ============================================================================
// COMPONENT
// ============================================================================

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      variant = "default",
      icon,
      emoji,
      title,
      description,
      action,
      iconBgColor = "bg-primary-100 dark:bg-primary-900/30",
      iconColor = "text-primary-600 dark:text-primary-400",
      className = "",
      ...props
    },
    ref
  ) => {
    const showIconCircle = variant !== "minimal" && (icon || emoji);

    const classes = [
      "text-center",
      variantStyles[variant],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={classes} {...props}>
        {/* Icon or Emoji */}
        {showIconCircle && (
          <div
            className={`
              w-16 h-16 rounded-full
              flex items-center justify-center
              mx-auto mb-4
              ${iconBgColor}
            `}
          >
            {emoji ? (
              <span className="text-3xl">{emoji}</span>
            ) : icon ? (
              <AppIcon name={icon} className={`w-8 h-8 ${iconColor}`} />
            ) : null}
          </div>
        )}

        {/* Minimal variant icon (no circle) */}
        {variant === "minimal" && icon && !emoji && (
          <AppIcon
            name={icon}
            className={`w-10 h-10 mx-auto mb-3 ${iconColor}`}
          />
        )}

        {/* Title */}
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-neutral-600 mb-4 max-w-sm mx-auto">
            {description}
          </p>
        )}

        {/* Action */}
        {action && <div className="mt-4">{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";

export default EmptyState;
