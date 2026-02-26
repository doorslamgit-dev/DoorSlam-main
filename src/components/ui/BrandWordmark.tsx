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

function DoorSlamLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="2" y="3.70459" width="10" height="13" rx="0.5"
        fill="hsl(var(--lime))"
      />
      <path
        d="M2 3.87574C2 3.68376 2.10992 3.50874 2.28285 3.42536L9.28285 0.050358C9.61483 -0.109705 10 0.132189 10 0.500743V19.9463C10 20.3053 9.63297 20.5473 9.30304 20.4059L2.30304 17.4059C2.1192 17.3271 2 17.1463 2 16.9463V3.87574Z"
        fill="hsl(var(--primary))"
      />
    </svg>
  );
}

export default function BrandWordmark({ size = "md", className, light }: BrandWordmarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-display font-bold tracking-tight",
        sizeClasses[size],
        className
      )}
    >
      <DoorSlamLogoIcon className="h-[1em] w-auto flex-shrink-0" />
      <span><span className={light ? "text-white" : "text-primary"}>DOOR</span><span className="text-lime">SLAM</span></span>
    </span>
  );
}
