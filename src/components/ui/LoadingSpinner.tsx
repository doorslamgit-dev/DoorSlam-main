// src/components/ui/LoadingSpinner.tsx
// Updated to use cn() and shadcn color tokens.

import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export type SpinnerSize = "sm" | "md" | "lg" | "xl";
export type SpinnerVariant = "spinner" | "dots";

export interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  message?: string;
  centered?: boolean;
}

// ============================================================================
// STYLE MAPPINGS
// ============================================================================

const sizeStyles: Record<SpinnerSize, { spinner: string; text: string }> = {
  sm: { spinner: "w-4 h-4 border-2", text: "text-xs" },
  md: { spinner: "w-6 h-6 border-2", text: "text-sm" },
  lg: { spinner: "w-8 h-8 border-2", text: "text-sm" },
  xl: { spinner: "w-12 h-12 border-3", text: "text-base" },
};

const centeredPadding: Record<SpinnerSize, string> = {
  sm: "py-4",
  md: "py-8",
  lg: "py-16",
  xl: "py-32",
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function Spinner({ size = "md", className }: { size?: SpinnerSize; className?: string }) {
  return (
    <div
      className={cn(
        sizeStyles[size].spinner,
        "border-primary border-t-transparent rounded-full animate-spin",
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

function Dots({ size = "md", className }: { size?: SpinnerSize; className?: string }) {
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : size === "md" ? "w-2 h-2" : "w-2.5 h-2.5";

  return (
    <div className={cn("flex gap-1", className)} role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(dotSize, "rounded-full bg-primary animate-bounce")}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  (
    {
      size = "md",
      variant = "spinner",
      message,
      centered = false,
      className,
      ...props
    },
    ref
  ) => {
    const SpinnerComponent = variant === "dots" ? Dots : Spinner;

    if (!centered && !message) {
      return <SpinnerComponent size={size} className={className} />;
    }

    return (
      <div
        ref={ref}
        className={cn(
          centered && "flex items-center justify-center",
          centered && centeredPadding[size],
          className
        )}
        {...props}
      >
        <div className="text-center">
          <SpinnerComponent size={size} className="mx-auto" />
          {message && (
            <p className={cn("mt-3 text-muted-foreground", sizeStyles[size].text)}>
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

// ============================================================================
// COMPOUND COMPONENTS
// ============================================================================

interface PageLoadingProps {
  message?: string;
}

function PageLoading({ message = "Loading..." }: PageLoadingProps) {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

const LoadingSpinnerWithCompounds = LoadingSpinner as typeof LoadingSpinner & {
  Page: typeof PageLoading;
};

LoadingSpinnerWithCompounds.Page = PageLoading;

export default LoadingSpinnerWithCompounds;
