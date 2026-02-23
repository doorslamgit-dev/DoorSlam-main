// src/components/ui/IconCircle.tsx
/**
 * IconCircle Component
 * ====================
 * A circular container that holds a single AppIcon.
 * Replaces the widespread inline pattern:
 *   <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
 *     <AppIcon name="star" className="w-4 h-4 text-primary-600" />
 *   </div>
 *
 * Found in 12+ components across the codebase:
 * - ProgressMomentsCard  (momentum event icons)
 * - UpgradeModal         (feature icons)
 * - ComingUpCard         (empty-state icon)
 * - ChildHealthCard      (insight row icons)
 * - SettingsPage         (section icons)
 * - SubjectCard          (status icon)
 * - RewardsMiniCard      (reward icons)
 * - DashboardRevisionPlan (subject icons)
 * … and more
 *
 * SIZES (circle / icon):
 * - xs  — 24px / 12px
 * - sm  — 32px / 16px  (default)
 * - md  — 40px / 20px
 * - lg  — 48px / 24px
 * - xl  — 64px / 32px
 *
 * VARIANTS:
 * - solid  — coloured bg, white icon   e.g. bg-primary-600 + text-white
 * - soft   — tinted bg, coloured icon  e.g. bg-primary-100 + text-primary-600
 * - ghost  — white/neutral bg, coloured icon with border
 *
 * COLORS:
 * - primary | success | warning | danger | info | neutral
 *
 * USAGE:
 * ```tsx
 * <IconCircle name="star" />
 * <IconCircle name="flame" color="warning" variant="soft" size="lg" />
 * <IconCircle name="check-circle" color="success" variant="solid" size="sm" />
 * ```
 */

import AppIcon from './AppIcon';
import type { IconKey } from './AppIcon';
import type { HTMLAttributes } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type IconCircleSize    = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconCircleColor   = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type IconCircleVariant = 'solid' | 'soft' | 'ghost';

export interface IconCircleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The icon to display (any registered AppIcon key) */
  name: IconKey;
  /** Circle + icon colour palette */
  color?: IconCircleColor;
  /** Visual treatment */
  variant?: IconCircleVariant;
  /** Size of the circle */
  size?: IconCircleSize;
  /** Accessible label for the icon (omit if decorative) */
  iconLabel?: string;
}

// ============================================================================
// STYLE MAPPINGS
// ============================================================================

/** [circleSize, iconSize] Tailwind class pairs */
const sizeMap: Record<IconCircleSize, [string, string]> = {
  xs: ['w-6 h-6',   'w-3 h-3'],
  sm: ['w-8 h-8',   'w-4 h-4'],
  md: ['w-10 h-10', 'w-5 h-5'],
  lg: ['w-12 h-12', 'w-6 h-6'],
  xl: ['w-16 h-16', 'w-8 h-8'],
};

const variantColorMap: Record<IconCircleVariant, Record<IconCircleColor, { bg: string; icon: string; border?: string }>> = {
  solid: {
    primary: { bg: 'bg-primary-600',    icon: 'text-white' },
    success: { bg: 'bg-accent-green',   icon: 'text-white' },
    warning: { bg: 'bg-accent-amber',   icon: 'text-white' },
    danger:  { bg: 'bg-accent-red',     icon: 'text-white' },
    info:    { bg: 'bg-accent-blue',    icon: 'text-white' },
    neutral: { bg: 'bg-neutral-600',    icon: 'text-white' },
  },
  soft: {
    primary: { bg: 'bg-primary-100 dark:bg-primary-900/30',  icon: 'text-primary-600 dark:text-primary-400' },
    success: { bg: 'bg-success-bg',                          icon: 'text-accent-green' },
    warning: { bg: 'bg-warning-bg',                          icon: 'text-accent-amber' },
    danger:  { bg: 'bg-error-bg',                            icon: 'text-accent-red' },
    info:    { bg: 'bg-info-bg',                             icon: 'text-accent-blue' },
    neutral: { bg: 'bg-neutral-100 dark:bg-neutral-800',     icon: 'text-neutral-500 dark:text-neutral-400' },
  },
  ghost: {
    primary: { bg: 'bg-neutral-0 dark:bg-neutral-800',       icon: 'text-primary-600', border: 'border border-neutral-200/50 dark:border-neutral-700 shadow-soft' },
    success: { bg: 'bg-neutral-0 dark:bg-neutral-800',       icon: 'text-accent-green', border: 'border border-neutral-200/50 dark:border-neutral-700 shadow-soft' },
    warning: { bg: 'bg-neutral-0 dark:bg-neutral-800',       icon: 'text-accent-amber', border: 'border border-neutral-200/50 dark:border-neutral-700 shadow-soft' },
    danger:  { bg: 'bg-neutral-0 dark:bg-neutral-800',       icon: 'text-accent-red',   border: 'border border-neutral-200/50 dark:border-neutral-700 shadow-soft' },
    info:    { bg: 'bg-neutral-0 dark:bg-neutral-800',       icon: 'text-accent-blue',  border: 'border border-neutral-200/50 dark:border-neutral-700 shadow-soft' },
    neutral: { bg: 'bg-neutral-0 dark:bg-neutral-800',       icon: 'text-neutral-500',  border: 'border border-neutral-200/50 dark:border-neutral-700 shadow-soft' },
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function IconCircle({
  name,
  color = 'primary',
  variant = 'soft',
  size = 'sm',
  iconLabel,
  className = '',
  ...props
}: IconCircleProps) {
  const [circleSize, iconSize] = sizeMap[size];
  const styles = variantColorMap[variant][color];

  return (
    <div
      className={[
        'rounded-full flex items-center justify-center flex-shrink-0',
        circleSize,
        styles.bg,
        styles.border ?? '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      <AppIcon
        name={name}
        className={`${iconSize} ${styles.icon}`}
        aria-label={iconLabel}
        aria-hidden={!iconLabel}
      />
    </div>
  );
}
