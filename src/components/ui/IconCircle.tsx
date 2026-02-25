// src/components/ui/IconCircle.tsx
// Updated to use cn() and shadcn color tokens.

import AppIcon from "./AppIcon";
import type { IconKey } from "./AppIcon";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export type IconCircleSize = "xs" | "sm" | "md" | "lg" | "xl";
export type IconCircleColor = "primary" | "success" | "warning" | "danger" | "info" | "neutral";
export type IconCircleVariant = "solid" | "soft" | "ghost";

export interface IconCircleProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  name: IconKey;
  color?: IconCircleColor;
  variant?: IconCircleVariant;
  size?: IconCircleSize;
  iconLabel?: string;
}

// ============================================================================
// STYLE MAPPINGS
// ============================================================================

const sizeMap: Record<IconCircleSize, [string, string]> = {
  xs: ["w-6 h-6", "w-3 h-3"],
  sm: ["w-8 h-8", "w-4 h-4"],
  md: ["w-10 h-10", "w-5 h-5"],
  lg: ["w-12 h-12", "w-6 h-6"],
  xl: ["w-16 h-16", "w-8 h-8"],
};

const variantColorMap: Record<IconCircleVariant, Record<IconCircleColor, { bg: string; icon: string; border?: string }>> = {
  solid: {
    primary: { bg: "bg-primary", icon: "text-primary-foreground" },
    success: { bg: "bg-success", icon: "text-success-foreground" },
    warning: { bg: "bg-warning", icon: "text-warning-foreground" },
    danger: { bg: "bg-destructive", icon: "text-destructive-foreground" },
    info: { bg: "bg-info", icon: "text-info-foreground" },
    neutral: { bg: "bg-muted-foreground", icon: "text-background" },
  },
  soft: {
    primary: { bg: "bg-primary/10 dark:bg-primary/20", icon: "text-primary" },
    success: { bg: "bg-success/10", icon: "text-success" },
    warning: { bg: "bg-warning/10", icon: "text-warning" },
    danger: { bg: "bg-destructive/10", icon: "text-destructive" },
    info: { bg: "bg-info/10", icon: "text-info" },
    neutral: { bg: "bg-muted", icon: "text-muted-foreground" },
  },
  ghost: {
    primary: { bg: "bg-background", icon: "text-primary", border: "border border-border/50 shadow-sm" },
    success: { bg: "bg-background", icon: "text-success", border: "border border-border/50 shadow-sm" },
    warning: { bg: "bg-background", icon: "text-warning", border: "border border-border/50 shadow-sm" },
    danger: { bg: "bg-background", icon: "text-destructive", border: "border border-border/50 shadow-sm" },
    info: { bg: "bg-background", icon: "text-info", border: "border border-border/50 shadow-sm" },
    neutral: { bg: "bg-background", icon: "text-muted-foreground", border: "border border-border/50 shadow-sm" },
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function IconCircle({
  name,
  color = "primary",
  variant = "soft",
  size = "sm",
  iconLabel,
  className,
  ...props
}: IconCircleProps) {
  const [circleSize, iconSize] = sizeMap[size];
  const styles = variantColorMap[variant][color];

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center flex-shrink-0",
        circleSize,
        styles.bg,
        styles.border,
        className
      )}
      {...props}
    >
      <AppIcon
        name={name}
        className={cn(iconSize, styles.icon)}
        aria-label={iconLabel}
        aria-hidden={!iconLabel}
      />
    </div>
  );
}
