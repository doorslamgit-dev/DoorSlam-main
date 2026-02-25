// src/components/ui/AvatarCircle.tsx
// Updated to use cn() and shadcn color tokens.

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export type AvatarCircleSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarCircleColor = "primary" | "soft" | "neutral";

export interface AvatarCircleProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  name: string;
  src?: string | null;
  size?: AvatarCircleSize;
  color?: AvatarCircleColor;
  bordered?: boolean;
  shrink?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ============================================================================
// STYLE MAPPINGS
// ============================================================================

const sizeStyles: Record<AvatarCircleSize, { circle: string; text: string; imgSize: number }> = {
  xs: { circle: "w-6 h-6", text: "text-[9px] font-semibold", imgSize: 24 },
  sm: { circle: "w-8 h-8", text: "text-xs font-semibold", imgSize: 32 },
  md: { circle: "w-10 h-10", text: "text-sm font-semibold", imgSize: 40 },
  lg: { circle: "w-14 h-14", text: "text-lg font-bold", imgSize: 56 },
  xl: { circle: "w-20 h-20", text: "text-2xl font-bold", imgSize: 80 },
};

const colorStyles: Record<AvatarCircleColor, { bg: string; text: string }> = {
  primary: { bg: "bg-primary", text: "text-primary-foreground" },
  soft: { bg: "bg-primary/10 dark:bg-primary/20", text: "text-primary" },
  neutral: { bg: "bg-muted", text: "text-muted-foreground" },
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function AvatarCircle({
  name,
  src,
  size = "md",
  color = "primary",
  bordered = false,
  shrink = false,
  className,
  ...props
}: AvatarCircleProps) {
  const { circle, text, imgSize } = sizeStyles[size];
  const { bg, text: textClass } = colorStyles[color];

  const borderClass = bordered ? "border-2 border-border" : "";
  const shrinkClass = shrink ? "" : "flex-shrink-0";

  if (src) {
    return (
      <div
        className={cn(circle, borderClass, shrinkClass, "rounded-full overflow-hidden", className)}
        {...props}
      >
        <img
          src={src}
          alt={name}
          width={imgSize}
          height={imgSize}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center select-none",
        circle,
        bg,
        textClass,
        borderClass,
        shrinkClass,
        className
      )}
      title={name}
      {...props}
    >
      <span className={text} aria-hidden="true">
        {deriveInitials(name)}
      </span>
    </div>
  );
}
