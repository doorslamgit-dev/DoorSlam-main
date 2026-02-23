// src/components/ui/AvatarCircle.tsx
/**
 * AvatarCircle Component
 * ======================
 * A circular user avatar that renders a photo when available, or a
 * coloured initials badge when no photo is provided.
 *
 * Extracts the repeated photo-with-initials-fallback pattern from:
 * - DashboardChildHeader   (40px, primary-600 bg)
 * - SidebarBottomSection   (32px, primary-600 bg)
 * - ChildHealthCard        (56px, primary-100 bg + border)
 * - ComingUpCard           (session participant avatars)
 *
 * SIZES:
 * - xs  — 24px  (w-6)
 * - sm  — 32px  (w-8)
 * - md  — 40px  (w-10)  ← default
 * - lg  — 56px  (w-14)
 * - xl  — 80px  (w-20)
 *
 * COLORS (for the initials fallback background):
 * - primary  — bg-primary-600, white text  (default)
 * - soft     — bg-primary-100, primary-600 text
 * - neutral  — bg-neutral-200, neutral-600 text
 *
 * USAGE:
 * ```tsx
 * // With photo
 * <AvatarCircle name="Alice Smith" src={child.avatar_url} size="md" />
 *
 * // Initials only, large with border
 * <AvatarCircle name="Bob Jones" size="lg" bordered />
 *
 * // Neutral palette in sidebar
 * <AvatarCircle name="Parent User" size="sm" color="neutral" />
 * ```
 */

import type { HTMLAttributes } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type AvatarCircleSize  = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarCircleColor = 'primary' | 'soft' | 'neutral';

export interface AvatarCircleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The person's display name — used to derive initials when no photo */
  name: string;
  /** Optional image URL; when provided the photo is shown instead of initials */
  src?: string | null;
  /** Circle size */
  size?: AvatarCircleSize;
  /** Colour palette for the initials fallback */
  color?: AvatarCircleColor;
  /** Show a subtle border ring */
  bordered?: boolean;
  /** Prevent flex shrinking when inside a flex container */
  shrink?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ============================================================================
// STYLE MAPPINGS
// ============================================================================

const sizeStyles: Record<AvatarCircleSize, { circle: string; text: string; imgSize: number }> = {
  xs: { circle: 'w-6 h-6',   text: 'text-[9px] font-semibold',  imgSize: 24 },
  sm: { circle: 'w-8 h-8',   text: 'text-xs font-semibold',     imgSize: 32 },
  md: { circle: 'w-10 h-10', text: 'text-sm font-semibold',     imgSize: 40 },
  lg: { circle: 'w-14 h-14', text: 'text-lg font-bold',         imgSize: 56 },
  xl: { circle: 'w-20 h-20', text: 'text-2xl font-bold',        imgSize: 80 },
};

const colorStyles: Record<AvatarCircleColor, { bg: string; text: string }> = {
  primary: { bg: 'bg-primary-600',                               text: 'text-white' },
  soft:    { bg: 'bg-primary-100 dark:bg-primary-900/40',        text: 'text-primary-600 dark:text-primary-400' },
  neutral: { bg: 'bg-neutral-200 dark:bg-neutral-700',           text: 'text-neutral-600 dark:text-neutral-300' },
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function AvatarCircle({
  name,
  src,
  size = 'md',
  color = 'primary',
  bordered = false,
  shrink = false,
  className = '',
  ...props
}: AvatarCircleProps) {
  const { circle, text, imgSize } = sizeStyles[size];
  const { bg, text: textClass } = colorStyles[color];

  const borderClass = bordered
    ? 'border-2 border-neutral-100 dark:border-neutral-700'
    : '';

  const shrinkClass = shrink ? '' : 'flex-shrink-0';

  if (src) {
    return (
      <div
        className={`${circle} ${borderClass} ${shrinkClass} rounded-full overflow-hidden ${className}`}
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
      className={[
        'rounded-full flex items-center justify-center select-none',
        circle,
        bg,
        textClass,
        borderClass,
        shrinkClass,
        className,
      ].filter(Boolean).join(' ')}
      title={name}
      {...props}
    >
      <span className={text} aria-hidden="true">
        {deriveInitials(name)}
      </span>
    </div>
  );
}
