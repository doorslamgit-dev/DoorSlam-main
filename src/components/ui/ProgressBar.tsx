// src/components/ui/ProgressBar.tsx
// shadcn-based ProgressBar with DoorSlam API compatibility.

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export type ProgressBarColor = "primary" | "success" | "warning" | "danger" | "info";
export type ProgressBarSize = "sm" | "md" | "lg" | "xl";

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  value: number;
  color?: ProgressBarColor;
  size?: ProgressBarSize;
  showValue?: boolean;
  label?: string;
  animated?: boolean;
}

// ============================================================================
// STYLE MAPPINGS
// ============================================================================

const fillStyles: Record<ProgressBarColor, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-info",
};

const trackStyles: Record<ProgressBarColor, string> = {
  primary: "bg-primary/10 dark:bg-primary/20",
  success: "bg-success/10",
  warning: "bg-warning/10",
  danger: "bg-destructive/10",
  info: "bg-info/10",
};

const sizeStyles: Record<ProgressBarSize, string> = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
  xl: "h-4",
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function ProgressBar({
  value,
  color = "primary",
  size = "md",
  showValue = false,
  label,
  animated = true,
  className,
  ...props
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", className)} {...props}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1">
          {label && (
            <span className="text-xs font-medium text-muted-foreground">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-xs font-semibold text-foreground">
              {clamped}%
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          "w-full rounded-full overflow-hidden",
          sizeStyles[size],
          trackStyles[color]
        )}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full",
            fillStyles[color],
            animated && "transition-all duration-500 ease-out"
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
