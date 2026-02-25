// src/components/ui/StatCard.tsx
// Updated to use cn() and shadcn color tokens.

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export type StatCardSize = "sm" | "md" | "lg";
export type StatCardValueColor = "default" | "primary" | "success" | "warning" | "danger" | "info" | "muted";
export type StatCardBackground = "neutral" | "white" | "primary" | "none";

export interface StatCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  label: string;
  value: string | number;
  sublabel?: string;
  valueColor?: StatCardValueColor;
  size?: StatCardSize;
  background?: StatCardBackground;
}

// ============================================================================
// STYLE MAPPINGS
// ============================================================================

const sizeStyles: Record<StatCardSize, {
  padding: string;
  label: string;
  value: string;
  sublabel: string;
}> = {
  sm: {
    padding: "p-2.5",
    label: "text-[10px] text-muted-foreground mb-0.5",
    value: "text-base font-bold",
    sublabel: "text-[9px] text-muted-foreground mt-0.5",
  },
  md: {
    padding: "p-3",
    label: "text-[11px] text-muted-foreground mb-1",
    value: "text-lg font-bold",
    sublabel: "text-[10px] text-muted-foreground mt-0.5",
  },
  lg: {
    padding: "p-4",
    label: "text-xs text-muted-foreground mb-1",
    value: "text-2xl font-bold",
    sublabel: "text-xs text-muted-foreground mt-1",
  },
};

const valueColorStyles: Record<StatCardValueColor, string> = {
  default: "text-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
  info: "text-info",
  muted: "text-muted-foreground",
};

const backgroundStyles: Record<StatCardBackground, string> = {
  neutral: "bg-muted",
  white: "bg-background",
  primary: "bg-primary/5",
  none: "",
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function StatCard({
  label,
  value,
  sublabel,
  valueColor = "default",
  size = "md",
  background = "neutral",
  className,
  ...props
}: StatCardProps) {
  const s = sizeStyles[size];

  return (
    <div
      className={cn("rounded-lg", s.padding, backgroundStyles[background], className)}
      {...props}
    >
      <p className={s.label}>{label}</p>
      <p className={cn(s.value, valueColorStyles[valueColor])}>{value}</p>
      {sublabel && <p className={s.sublabel}>{sublabel}</p>}
    </div>
  );
}
