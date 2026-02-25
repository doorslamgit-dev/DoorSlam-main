// src/components/ui/Badge.tsx
// shadcn-based Badge with DoorSlam API compatibility.

import { type HTMLAttributes, type ReactNode, forwardRef } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import AppIcon from "./AppIcon";
import type { IconKey } from "./AppIcon";

// ============================================================================
// CVA VARIANTS
// ============================================================================

const badgeVariants = cva(
  "inline-flex items-center font-medium rounded-full",
  {
    variants: {
      variant: {
        default: "",
        primary: "",
        success: "",
        warning: "",
        danger: "",
        info: "",
        // shadcn standard aliases
        destructive: "",
        secondary: "",
        outline: "",
      },
      badgeStyle: {
        solid: "",
        soft: "",
        outline: "",
      },
      size: {
        sm: "px-2 py-0.5 text-xs gap-1",
        md: "px-2.5 py-1 text-xs gap-1.5",
        lg: "px-3 py-1.5 text-sm gap-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      badgeStyle: "soft",
      size: "md",
    },
    compoundVariants: [
      // Solid styles
      { variant: "default", badgeStyle: "solid", className: "bg-secondary text-foreground" },
      { variant: "primary", badgeStyle: "solid", className: "bg-primary text-primary-foreground" },
      { variant: "success", badgeStyle: "solid", className: "bg-success text-success-foreground" },
      { variant: "warning", badgeStyle: "solid", className: "bg-warning text-warning-foreground" },
      { variant: "danger", badgeStyle: "solid", className: "bg-destructive text-destructive-foreground" },
      { variant: "info", badgeStyle: "solid", className: "bg-info text-info-foreground" },
      // Soft styles
      { variant: "default", badgeStyle: "soft", className: "bg-secondary text-muted-foreground" },
      { variant: "primary", badgeStyle: "soft", className: "bg-primary/10 text-primary dark:bg-primary/20" },
      { variant: "success", badgeStyle: "soft", className: "bg-success/10 text-success" },
      { variant: "warning", badgeStyle: "soft", className: "bg-warning/10 text-warning" },
      { variant: "danger", badgeStyle: "soft", className: "bg-destructive/10 text-destructive" },
      { variant: "info", badgeStyle: "soft", className: "bg-info/10 text-info" },
      // Outline styles
      { variant: "default", badgeStyle: "outline", className: "border border-border text-muted-foreground" },
      { variant: "primary", badgeStyle: "outline", className: "border border-primary/30 text-primary" },
      { variant: "success", badgeStyle: "outline", className: "border border-success/30 text-success" },
      { variant: "warning", badgeStyle: "outline", className: "border border-warning/30 text-warning" },
      { variant: "danger", badgeStyle: "outline", className: "border border-destructive/30 text-destructive" },
      { variant: "info", badgeStyle: "outline", className: "border border-info/30 text-info" },
    ],
  }
);

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
  variant?: BadgeVariant;
  size?: BadgeSize;
  badgeStyle?: BadgeStyle;
  icon?: IconKey;
  dot?: boolean;
  children: ReactNode;
}

// ============================================================================
// DOT / ICON SIZES
// ============================================================================

const iconSizeMap: Record<string, string> = {
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
  lg: "w-4 h-4",
};

const dotSizeMap: Record<string, string> = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-2 h-2",
};

const dotColorMap: Record<BadgeVariant, string> = {
  default: "bg-muted-foreground",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-info",
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
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, badgeStyle, size }), className)}
        {...props}
      >
        {dot && (
          <span
            className={cn("rounded-full", dotSizeMap[size], dotColorMap[variant])}
            aria-hidden="true"
          />
        )}
        {icon && !dot && <AppIcon name={icon} className={iconSizeMap[size]} />}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

// ============================================================================
// HELPER: Status to variant mapping
// ============================================================================

export const STATUS_TO_BADGE_VARIANT: Record<string, BadgeVariant> = {
  on_track: "success",
  completed: "success",
  complete: "success",
  active: "success",
  approved: "success",
  needs_attention: "warning",
  pending: "warning",
  in_progress: "warning",
  waiting: "warning",
  behind: "danger",
  declined: "danger",
  failed: "danger",
  error: "danger",
  not_started: "default",
  inactive: "default",
  draft: "default",
};

export default Badge;
export { Badge, badgeVariants };
