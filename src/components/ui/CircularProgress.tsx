// src/components/ui/CircularProgress.tsx
// Updated to use cn() and shadcn color tokens.

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export type CircularProgressColorToken = "primary" | "success" | "warning" | "danger" | "info" | "neutral";
export type CircularProgressSizePreset = "sm" | "md" | "lg" | "xl";

export interface CircularProgressProps {
  value: number;
  max?: number;
  color?: CircularProgressColorToken | (string & {});
  trackColor?: string;
  size?: CircularProgressSizePreset | number;
  strokeWidth?: number;
  animated?: boolean;
  children?: ReactNode;
  className?: string;
  "aria-label"?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TOKEN_COLORS: Record<CircularProgressColorToken, string> = {
  primary: "hsl(var(--primary))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  danger: "hsl(var(--destructive))",
  info: "hsl(var(--info))",
  neutral: "hsl(var(--muted-foreground))",
};

const TRACK_DEFAULT = "hsl(var(--border))";

const SIZE_PRESETS: Record<CircularProgressSizePreset, number> = {
  sm: 64,
  md: 96,
  lg: 128,
  xl: 160,
};

const TOKEN_NAMES = new Set<string>(["primary", "success", "warning", "danger", "info", "neutral"]);

// ============================================================================
// COMPONENT
// ============================================================================

export default function CircularProgress({
  value,
  max = 100,
  color = "primary",
  trackColor = TRACK_DEFAULT,
  size = "md",
  strokeWidth = 10,
  animated = true,
  children,
  className,
  "aria-label": ariaLabel,
}: CircularProgressProps) {
  const diameter = typeof size === "number" ? size : SIZE_PRESETS[size];

  const fillColor = TOKEN_NAMES.has(color as string)
    ? TOKEN_COLORS[color as CircularProgressColorToken]
    : (color as string);

  const radius = (diameter - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clamped = max > 0 ? Math.min(Math.max(value, 0), max) / max : 0;
  const offset = circumference - clamped * circumference;

  const cx = diameter / 2;
  const cy = diameter / 2;

  return (
    <div
      className={cn("relative flex-shrink-0", className)}
      style={{ width: diameter, height: diameter }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel}
    >
      <svg
        width={diameter}
        height={diameter}
        className="transform -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={animated ? { transition: "stroke-dashoffset 0.5s ease-out" } : undefined}
        />
      </svg>

      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
