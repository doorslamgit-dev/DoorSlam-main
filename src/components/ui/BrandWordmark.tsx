import { cn } from "../../lib/utils";

interface BrandWordmarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Use light text (for dark backgrounds like hero sections) */
  light?: boolean;
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-4xl",
} as const;

export default function BrandWordmark({ size = "md", className, light }: BrandWordmarkProps) {
  return (
    <span
      className={cn(
        "font-display font-bold tracking-tight",
        sizeClasses[size],
        light ? "text-white" : "text-foreground",
        className
      )}
    >
      DOOR<span className="text-lime">SLAM</span>
    </span>
  );
}
