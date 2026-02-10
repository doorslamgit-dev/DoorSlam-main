// src/components/ui/Alert.tsx
/**
 * Alert Component
 * ===============
 * Displays feedback messages to users (errors, success, warnings, info).
 *
 * VARIANTS:
 * - error: For errors and failures (red)
 * - success: For successful actions (green)
 * - warning: For cautionary messages (amber)
 * - info: For informational messages (blue)
 *
 * FEATURES:
 * - Optional close button (dismissible)
 * - Icon automatically selected by variant (or custom)
 * - Title + description layout
 * - Action button support
 * - Accessible with proper ARIA roles
 *
 * USAGE:
 * ```tsx
 * // Simple error alert
 * <Alert variant="error">
 *   Failed to save changes. Please try again.
 * </Alert>
 *
 * // Dismissible success alert
 * <Alert variant="success" onClose={() => setShow(false)}>
 *   Your changes have been saved!
 * </Alert>
 *
 * // Alert with title and action
 * <Alert
 *   variant="warning"
 *   title="Session Expiring"
 *   action={<Button size="sm">Extend</Button>}
 * >
 *   Your session will expire in 5 minutes.
 * </Alert>
 * ```
 */

import { type HTMLAttributes, type ReactNode, forwardRef } from "react";
import AppIcon from "./AppIcon";
import type { IconKey } from "./AppIcon";

// ============================================================================
// TYPES
// ============================================================================

export type AlertVariant = "error" | "success" | "warning" | "info";

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Visual style variant */
  variant?: AlertVariant;
  /** Alert title (optional, renders above children) */
  title?: string;
  /** Custom icon (defaults to variant-specific icon) */
  icon?: IconKey;
  /** Hide the icon */
  hideIcon?: boolean;
  /** Called when close button is clicked (shows close button if provided) */
  onClose?: () => void;
  /** Action element (renders on the right) */
  action?: ReactNode;
  /** Alert content/description */
  children: ReactNode;
}

// ============================================================================
// STYLE MAPPINGS
// ============================================================================

/**
 * Variant styles define colors
 * Uses semantic accent colors from design tokens
 */
const variantStyles: Record<AlertVariant, {
  container: string;
  icon: string;
  title: string;
  text: string;
}> = {
  error: {
    container: "bg-danger-bg border-danger-border",
    icon: "text-danger",
    title: "text-danger",
    text: "text-danger",
  },
  success: {
    container: "bg-success-bg border-success-border",
    icon: "text-success",
    title: "text-success",
    text: "text-success",
  },
  warning: {
    container: "bg-warning-bg border-warning-border",
    icon: "text-warning",
    title: "text-warning",
    text: "text-warning",
  },
  info: {
    container: "bg-info-bg border-info-border",
    icon: "text-info",
    title: "text-info",
    text: "text-info",
  },
};

/**
 * Default icons per variant
 */
const variantIcons: Record<AlertVariant, IconKey> = {
  error: "triangle-alert",
  success: "check-circle",
  warning: "triangle-alert",
  info: "info",
};

/**
 * ARIA roles per variant for accessibility
 */
const variantRoles: Record<AlertVariant, "alert" | "status"> = {
  error: "alert",
  success: "status",
  warning: "alert",
  info: "status",
};

// ============================================================================
// COMPONENT
// ============================================================================

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = "info",
      title,
      icon,
      hideIcon = false,
      onClose,
      action,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const styles = variantStyles[variant];
    const iconName = icon ?? variantIcons[variant];

    const baseStyles = [
      "rounded-xl",
      "border",
      "p-4",
    ].join(" ");

    const classes = [
      baseStyles,
      styles.container,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        ref={ref}
        role={variantRoles[variant]}
        className={classes}
        {...props}
      >
        <div className="flex gap-3">
          {/* Icon */}
          {!hideIcon && (
            <div className="flex-shrink-0 pt-0.5">
              <AppIcon name={iconName} className={`w-5 h-5 ${styles.icon}`} />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className={`font-semibold text-sm ${styles.title}`}>
                {title}
              </h4>
            )}
            <div className={`text-sm ${title ? "mt-1" : ""} ${styles.text}`}>
              {children}
            </div>
          </div>

          {/* Action or Close button */}
          <div className="flex-shrink-0 flex items-start gap-2">
            {action}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className={`p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${styles.text}`}
                aria-label="Dismiss"
              >
                <AppIcon name="x" className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Alert.displayName = "Alert";

export default Alert;
