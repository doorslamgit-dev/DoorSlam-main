// src/components/ui/index.ts
/**
 * UI Component Library Exports
 * ============================
 * Central export file for all reusable UI components.
 *
 * Usage:
 * import { Button, Card, Alert } from '@/components/ui';
 *
 * See UI_COMPONENTS.md for full documentation.
 */

// Core Components
export { default as Button } from "./Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button";

export { default as Card } from "./Card";
export type { CardProps, CardVariant, CardPadding } from "./Card";

export { default as Alert } from "./Alert";
export type { AlertProps, AlertVariant } from "./Alert";

export { default as Badge } from "./Badge";
export { STATUS_TO_BADGE_VARIANT } from "./Badge";
export type { BadgeProps, BadgeVariant, BadgeSize, BadgeStyle } from "./Badge";

// Form Components
export { default as FormField } from "./FormField";
export type { InputProps, TextareaProps } from "./FormField";

// Feedback Components
export { default as LoadingSpinner } from "./LoadingSpinner";
export type { LoadingSpinnerProps, SpinnerSize, SpinnerVariant } from "./LoadingSpinner";

export { default as EmptyState } from "./EmptyState";
export type { EmptyStateProps, EmptyStateVariant } from "./EmptyState";

// Existing Components
export { default as AppIcon } from "./AppIcon";
export type { IconKey } from "./AppIcon";

export { default as ThemeToggle } from "./ThemeToggle";

// Note: ErrorBoundary is at src/components/ErrorBoundary.tsx (not in ui folder)
