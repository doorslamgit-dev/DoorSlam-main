// src/components/ui/ProgressBar.tsx
/**
 * ProgressBar Component
 * =====================
 * A standalone, accessible progress bar.
 *
 * Replaces the repeated inline pattern found across:
 * - TodayProgressCard (sessions completed)
 * - SessionCard (topic progress)
 * - SubjectCard (subject coverage)
 * - RewardsMiniCard (next goal progress)
 * - DashboardRevisionPlan (subject rows)
 *
 * VARIANTS (color):
 * - primary    — brand purple (default)
 * - success    — accent-green
 * - warning    — accent-amber
 * - danger     — accent-red
 * - info       — accent-blue
 *
 * SIZES:
 * - sm  — 4px  (h-1)
 * - md  — 8px  (h-2)  — default
 * - lg  — 12px (h-3)
 * - xl  — 16px (h-4)
 *
 * USAGE:
 * ```tsx
 * // Basic
 * <ProgressBar value={65} />
 *
 * // With label and value display
 * <ProgressBar value={40} color="success" size="lg" showValue label="Coverage" />
 *
 * // Custom className on track
 * <ProgressBar value={75} color="warning" size="sm" />
 * ```
 */

import type { HTMLAttributes } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type ProgressBarColor = 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type ProgressBarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Progress value 0–100 */
  value: number;
  /** Colour of the filled bar */
  color?: ProgressBarColor;
  /** Height of the bar */
  size?: ProgressBarSize;
  /** Show percentage label beside the bar */
  showValue?: boolean;
  /** Optional label above the bar */
  label?: string;
  /** Enable CSS transition animation */
  animated?: boolean;
}

// ============================================================================
// STYLE MAPPINGS
// ============================================================================

const fillStyles: Record<ProgressBarColor, string> = {
  primary: 'bg-primary-600',
  success:  'bg-accent-green',
  warning:  'bg-accent-amber',
  danger:   'bg-accent-red',
  info:     'bg-accent-blue',
};

const trackStyles: Record<ProgressBarColor, string> = {
  primary: 'bg-primary-100  dark:bg-primary-900/30',
  success:  'bg-success-bg',
  warning:  'bg-warning-bg',
  danger:   'bg-error-bg',
  info:     'bg-info-bg',
};

const sizeStyles: Record<ProgressBarSize, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
  xl: 'h-4',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function ProgressBar({
  value,
  color = 'primary',
  size = 'md',
  showValue = false,
  label,
  animated = true,
  className = '',
  ...props
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full ${className}`} {...props}>
      {/* Label row */}
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1">
          {label && (
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              {clamped}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        className={`w-full rounded-full overflow-hidden ${sizeStyles[size]} ${trackStyles[color]}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Fill */}
        <div
          className={`h-full rounded-full ${fillStyles[color]} ${animated ? 'transition-all duration-500 ease-out' : ''}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
