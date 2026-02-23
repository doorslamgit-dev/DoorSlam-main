// src/components/ui/CircularProgress.tsx
/**
 * CircularProgress Component
 * ==========================
 * An SVG ring-based progress indicator with an optional centre slot for labels.
 *
 * Extracts the duplicated CircularProgress component from:
 * - MomentumWidget     (streak + pace rings, uses direct hex colors)
 * - HealthScoreCard    (health score ring, uses Tailwind currentColor)
 *
 * PROPS:
 * - value       — current value (0 → max)
 * - max         — maximum value  (default 100, so value acts as %)
 * - color       — CSS color string OR ProgressBarColor token
 * - trackColor  — CSS color string for the unfilled arc (default neutral-100)
 * - size        — pixel diameter OR size preset
 * - strokeWidth — SVG stroke width in px (default 10)
 * - animated    — enable CSS transition on the fill arc (default true)
 * - children    — content rendered in the centre (value label, icon, etc.)
 *
 * SIZE PRESETS:
 * - sm  — 64px
 * - md  — 96px   (default)
 * - lg  — 128px
 * - xl  — 160px
 *
 * COLOR TOKENS (maps to CSS custom properties from themes.css):
 * - primary | success | warning | danger | info
 * OR pass any valid CSS color string directly.
 *
 * USAGE:
 * ```tsx
 * // Simple percentage ring
 * <CircularProgress value={72} />
 *
 * // Streak counter with custom colour
 * <CircularProgress value={currentStreak} max={longestStreak} color="#5B2CFF" size="lg">
 *   <span className="text-2xl font-bold">{currentStreak}</span>
 *   <span className="text-xs text-neutral-500">days</span>
 * </CircularProgress>
 *
 * // Token colour
 * <CircularProgress value={85} color="success" size="sm">
 *   <span className="text-sm font-bold text-accent-green">85%</span>
 * </CircularProgress>
 * ```
 */

import type { ReactNode } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type CircularProgressColorToken = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type CircularProgressSizePreset = 'sm' | 'md' | 'lg' | 'xl';

export interface CircularProgressProps {
  /** Current progress value */
  value: number;
  /** Maximum value — value / max determines fill percentage */
  max?: number;
  /**
   * Fill colour — accepts either a design-token name
   * ('primary' | 'success' | 'warning' | 'danger' | 'info')
   * or any valid CSS color string (hex, rgb, hsl, var(--…)).
   */
  color?: CircularProgressColorToken | (string & {});
  /** Unfilled track colour — CSS color string */
  trackColor?: string;
  /**
   * Diameter in pixels, or a size preset:
   * 'sm' → 64, 'md' → 96, 'lg' → 128, 'xl' → 160
   */
  size?: CircularProgressSizePreset | number;
  /** SVG stroke width in px */
  strokeWidth?: number;
  /** Enable CSS transition animation on the fill arc */
  animated?: boolean;
  /** Content rendered in the centre of the ring */
  children?: ReactNode;
  /** Optional className on the wrapper div */
  className?: string;
  /** ARIA label for the progress indicator */
  'aria-label'?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TOKEN_COLORS: Record<CircularProgressColorToken, string> = {
  primary: 'var(--color-primary-600, #5B2CFF)',
  success: 'var(--color-accent-green, #1EC592)',
  warning: 'var(--color-accent-amber, #FFB547)',
  danger:  'var(--color-accent-red, #F05151)',
  info:    'var(--color-accent-blue, #5B8DEF)',
  neutral: 'var(--color-neutral-400, #A8AEBD)',
};

const TRACK_DEFAULT = 'var(--color-neutral-200, #E1E4EE)';

const SIZE_PRESETS: Record<CircularProgressSizePreset, number> = {
  sm: 64,
  md: 96,
  lg: 128,
  xl: 160,
};

const TOKEN_NAMES = new Set<string>(['primary', 'success', 'warning', 'danger', 'info', 'neutral']);

// ============================================================================
// COMPONENT
// ============================================================================

export default function CircularProgress({
  value,
  max = 100,
  color = 'primary',
  trackColor = TRACK_DEFAULT,
  size = 'md',
  strokeWidth = 10,
  animated = true,
  children,
  className = '',
  'aria-label': ariaLabel,
}: CircularProgressProps) {
  // Resolve size
  const diameter = typeof size === 'number' ? size : SIZE_PRESETS[size];

  // Resolve fill colour
  const fillColor = TOKEN_NAMES.has(color as string)
    ? TOKEN_COLORS[color as CircularProgressColorToken]
    : (color as string);

  // Geometry
  const radius = (diameter - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clamped = max > 0 ? Math.min(Math.max(value, 0), max) / max : 0;
  const offset = circumference - clamped * circumference;

  const cx = diameter / 2;
  const cy = diameter / 2;

  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: diameter, height: diameter }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel}
    >
      {/* SVG ring */}
      <svg
        width={diameter}
        height={diameter}
        className="transform -rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
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
          style={animated ? { transition: 'stroke-dashoffset 0.5s ease-out' } : undefined}
        />
      </svg>

      {/* Centre content */}
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
