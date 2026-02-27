// src/components/ui/EmptyState.tsx
// Updated to use cn() and shadcn color tokens.

import { type HTMLAttributes, type ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";
import AppIcon from "./AppIcon";
import type { IconKey } from "./AppIcon";

// ============================================================================
// TYPES
// ============================================================================

export type EmptyStateVariant = "default" | "minimal" | "card";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  variant?: EmptyStateVariant;
  icon?: IconKey;
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
}

// ============================================================================
// STYLE MAPPINGS
// ============================================================================

const variantStyles: Record<EmptyStateVariant, string> = {
  default: "py-8",
  minimal: "py-6",
  card: "bg-card rounded-xl shadow-sm p-8",
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
      iconBgColor = "bg-primary/10 dark:bg-primary/20",
      iconColor = "text-primary",
      className,
      ...props
    },
    ref
  ) => {
    const showIconCircle = variant !== "minimal" && (icon || emoji);

    return (
      <div ref={ref} className={cn("text-center", variantStyles[variant], className)} {...props}>
        {showIconCircle && (
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
              iconBgColor
            )}
          >
            {emoji ? (
              <span className="text-3xl">{emoji}</span>
            ) : icon ? (
              <AppIcon name={icon} className={cn("w-8 h-8", iconColor)} />
            ) : null}
          </div>
        )}

        {variant === "minimal" && icon && !emoji && (
          <AppIcon
            name={icon}
            className={cn("w-10 h-10 mx-auto mb-3", iconColor)}
          />
        )}

        <h3 className={cn("font-semibold text-foreground mb-2", variant === "minimal" ? "text-sm" : "text-lg")}>
          {title}
        </h3>

        {description && (
          <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
            {description}
          </p>
        )}

        {action && <div className="mt-4">{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";

export default EmptyState;
