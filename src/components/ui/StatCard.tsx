// src/components/ui/StatCard.tsx
/**
 * StatCard Component
 * ==================
 * A compact KPI cell displaying a label, a primary value, and an optional sublabel.
 *
 * Extracts the repeated inline pattern:
 *   <div className="bg-neutral-50 rounded-lg p-3">
 *     <p className="text-[11px] text-neutral-500 mb-1">Label</p>
 *     <p className="text-lg font-bold text-primary-900">Value</p>
 *     <p className="text-[10px] text-neutral-400">Sub-label</p>
 *   </div>
 *
 * Used in:
 * - DashboardHeroCard       (3 KPI cols: sessions, confidence, focus)
 * - HeroStoryWidget         (weekly KPIs)
 * - ProgressPlanWidget      (coverage stats)
 * - ChildRewardsCatalog     (points / streak cells)
 *
 * SIZES:
 * - sm   — compact (text-[10px] label, text-base value)
 * - md   — default (text-[11px] label, text-lg value)
 * - lg   — prominent (text-xs label, text-2xl value)
 *
 * VALUE COLORS:
 * - default  — text-primary-900 (dark charcoal)
 * - primary  — text-primary-600 (brand purple)
 * - success  — text-accent-green
 * - warning  — text-accent-amber
 * - danger   — text-accent-red
 * - info     — text-accent-blue
 * - muted    — text-neutral-500
 *
 * BACKGROUNDS:
 * - neutral  — bg-neutral-50 (default)
 * - white    — bg-neutral-0
 * - primary  — bg-primary-50
 * - none     — transparent
 *
 * USAGE:
 * ```tsx
 * <StatCard label="Sessions Completed" value="4/7" sublabel="57% completion rate" />
 *
 * <StatCard
 *   label="Avg Confidence Change"
 *   value="+12%"
 *   valueColor="success"
 *   sublabel="Pre → Post session growth"
 *   size="lg"
 * />
 * ```
 */

import type { HTMLAttributes } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type StatCardSize = 'sm' | 'md' | 'lg';
export type StatCardValueColor = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'muted';
export type StatCardBackground = 'neutral' | 'white' | 'primary' | 'none';

export interface StatCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Top-line descriptor */
  label: string;
  /** Primary metric value (string so callers format as they wish) */
  value: string | number;
  /** Optional supporting text below the value */
  sublabel?: string;
  /** Colour of the value text */
  valueColor?: StatCardValueColor;
  /** Overall size of the cell */
  size?: StatCardSize;
  /** Background fill */
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
    padding:  'p-2.5',
    label:    'text-[10px] text-neutral-500 mb-0.5',
    value:    'text-base font-bold',
    sublabel: 'text-[9px] text-neutral-400 mt-0.5',
  },
  md: {
    padding:  'p-3',
    label:    'text-[11px] text-neutral-500 mb-1',
    value:    'text-lg font-bold',
    sublabel: 'text-[10px] text-neutral-400 mt-0.5',
  },
  lg: {
    padding:  'p-4',
    label:    'text-xs text-neutral-500 mb-1',
    value:    'text-2xl font-bold',
    sublabel: 'text-xs text-neutral-400 mt-1',
  },
};

const valueColorStyles: Record<StatCardValueColor, string> = {
  default: 'text-primary-900',
  primary: 'text-primary-600',
  success: 'text-accent-green',
  warning: 'text-accent-amber',
  danger:  'text-accent-red',
  info:    'text-accent-blue',
  muted:   'text-neutral-500',
};

const backgroundStyles: Record<StatCardBackground, string> = {
  neutral: 'bg-neutral-50',
  white:   'bg-neutral-0',
  primary: 'bg-primary-50',
  none:    '',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function StatCard({
  label,
  value,
  sublabel,
  valueColor = 'default',
  size = 'md',
  background = 'neutral',
  className = '',
  ...props
}: StatCardProps) {
  const s = sizeStyles[size];

  return (
    <div
      className={`rounded-lg ${s.padding} ${backgroundStyles[background]} ${className}`}
      {...props}
    >
      <p className={s.label}>{label}</p>
      <p className={`${s.value} ${valueColorStyles[valueColor]}`}>{value}</p>
      {sublabel && <p className={s.sublabel}>{sublabel}</p>}
    </div>
  );
}
