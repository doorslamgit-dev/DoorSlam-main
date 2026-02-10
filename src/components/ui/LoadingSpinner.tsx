// src/components/ui/LoadingSpinner.tsx
/**
 * LoadingSpinner Component
 * ========================
 * A consistent loading indicator for async operations.
 *
 * SIZES:
 * - sm: Small spinner (w-4 h-4) - for buttons, inline loading
 * - md: Medium spinner (w-6 h-6) - default
 * - lg: Large spinner (w-8 h-8) - for page/section loading
 * - xl: Extra large (w-12 h-12) - for full-page loading states
 *
 * VARIANTS:
 * - spinner: Classic rotating circle (default)
 * - dots: Three bouncing dots
 *
 * FEATURES:
 * - Optional loading message
 * - Centered layout option for full containers
 * - Customizable colors via className
 * - Accessible with proper ARIA attributes
 *
 * USAGE:
 * ```tsx
 * // Simple spinner
 * <LoadingSpinner />
 *
 * // Page loading state
 * <LoadingSpinner size="lg" message="Loading settings..." centered />
 *
 * // Inline/button loading
 * <LoadingSpinner size="sm" />
 *
 * // Full page loading
 * <LoadingSpinner.Page message="Loading your dashboard..." />
 * ```
 */

import { type HTMLAttributes, forwardRef } from "react";

// ============================================================================
// TYPES
// ============================================================================

export type SpinnerSize = "sm" | "md" | "lg" | "xl";
export type SpinnerVariant = "spinner" | "dots";

export interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /** Size preset */
  size?: SpinnerSize;
  /** Visual variant */
  variant?: SpinnerVariant;
  /** Loading message to display */
  message?: string;
  /** Center in container with padding */
  centered?: boolean;
}

// ============================================================================
// STYLE MAPPINGS
// ============================================================================

/**
 * Size styles for the spinner
 */
const sizeStyles: Record<SpinnerSize, { spinner: string; text: string }> = {
  sm: { spinner: "w-4 h-4 border-2", text: "text-xs" },
  md: { spinner: "w-6 h-6 border-2", text: "text-sm" },
  lg: { spinner: "w-8 h-8 border-2", text: "text-sm" },
  xl: { spinner: "w-12 h-12 border-3", text: "text-base" },
};

/**
 * Centered container padding per size
 */
const centeredPadding: Record<SpinnerSize, string> = {
  sm: "py-4",
  md: "py-8",
  lg: "py-16",
  xl: "py-32",
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Classic rotating spinner
 */
function Spinner({ size = "md", className = "" }: { size?: SpinnerSize; className?: string }) {
  return (
    <div
      className={`
        ${sizeStyles[size].spinner}
        border-primary-600 border-t-transparent
        rounded-full animate-spin
        ${className}
      `}
      role="status"
      aria-label="Loading"
    />
  );
}

/**
 * Three bouncing dots
 */
function Dots({ size = "md", className = "" }: { size?: SpinnerSize; className?: string }) {
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : size === "md" ? "w-2 h-2" : "w-2.5 h-2.5";

  return (
    <div className={`flex gap-1 ${className}`} role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`
            ${dotSize} rounded-full bg-primary-600
            animate-bounce
          `}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

/**
 * Main LoadingSpinner component
 */
const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  (
    {
      size = "md",
      variant = "spinner",
      message,
      centered = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const SpinnerComponent = variant === "dots" ? Dots : Spinner;

    if (!centered && !message) {
      // Simple inline spinner
      return <SpinnerComponent size={size} className={className} />;
    }

    const containerClasses = [
      centered ? "flex items-center justify-center" : "",
      centered ? centeredPadding[size] : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={containerClasses} {...props}>
        <div className="text-center">
          <SpinnerComponent size={size} className="mx-auto" />
          {message && (
            <p className={`mt-3 text-neutral-600 ${sizeStyles[size].text}`}>
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

/**
 * Full-page loading state with consistent layout
 * Wraps content in standard page padding
 */
interface PageLoadingProps {
  message?: string;
}

function PageLoading({ message = "Loading..." }: PageLoadingProps) {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-3" />
        <p className="text-sm text-neutral-600">{message}</p>
      </div>
    </div>
  );
}

// Attach compound components
const LoadingSpinnerWithCompounds = LoadingSpinner as typeof LoadingSpinner & {
  Page: typeof PageLoading;
};

LoadingSpinnerWithCompounds.Page = PageLoading;

export default LoadingSpinnerWithCompounds;
