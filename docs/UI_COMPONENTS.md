# UI Component Library

A comprehensive guide to the Doorslam UI component system. This document is designed for developers and designers to understand available components, their variants, and usage patterns.

**Location:** `src/components/ui/`

---

## Table of Contents

1. [Button](#button)
2. [Card](#card)
3. [Alert](#alert)
4. [LoadingSpinner](#loadingspinner)
5. [FormField](#formfield)
6. [EmptyState](#emptystate)
7. [Badge](#badge)
8. [AppIcon](#appicon)
9. [ThemeToggle](#themetoggle)
10. [Design Tokens Reference](#design-tokens-reference)

---

## Button

**File:** `Button.tsx`

Consistent, accessible button component with multiple variants.

### Variants

| Variant | Use Case | Appearance |
|---------|----------|------------|
| `primary` | Main CTAs, form submissions | Purple background, white text |
| `secondary` | Secondary actions | Gray background, dark text, border |
| `ghost` | Tertiary actions, minimal UI | Transparent, no border |
| `danger` | Destructive actions | Red background, white text |

### Sizes

| Size | Padding | Use Case |
|------|---------|----------|
| `sm` | py-2 px-3 | Compact spaces, table actions |
| `md` | py-2.5 px-4 | Default, most buttons |
| `lg` | py-3 px-6 | Prominent CTAs, hero sections |

### Props

```typescript
interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;      // Shows spinner, disables button
  leftIcon?: IconKey;     // Icon on left side
  rightIcon?: IconKey;    // Icon on right side
  fullWidth?: boolean;    // Spans container width
  disabled?: boolean;
  children: ReactNode;
}
```

### Examples

```tsx
// Primary CTA
<Button variant="primary" size="lg">
  Get Started
</Button>

// With icon
<Button variant="secondary" leftIcon="arrow-left">
  Go Back
</Button>

// Loading state
<Button variant="primary" loading>
  Saving...
</Button>

// Danger action
<Button variant="danger" leftIcon="trash-2">
  Delete
</Button>
```

### Visual Reference

```
┌─────────────────────────────────────────────────────────────┐
│  PRIMARY        SECONDARY       GHOST          DANGER       │
│  ┌─────────┐   ┌─────────┐    ┌─────────┐   ┌─────────┐    │
│  │ Button  │   │ Button  │    │ Button  │   │ Button  │    │
│  └─────────┘   └─────────┘    └─────────┘   └─────────┘    │
│  Purple bg     Gray bg        Transparent   Red bg         │
│  White text    Dark text      Dark text     White text     │
└─────────────────────────────────────────────────────────────┘
```

---

## Card

**File:** `Card.tsx`

Flexible container for grouping related content.

### Variants

| Variant | Use Case | Appearance |
|---------|----------|------------|
| `default` | Most cards | Subtle shadow, light border |
| `elevated` | Featured content, CTAs | Prominent shadow |
| `outlined` | Lists, secondary content | Border only, no shadow |
| `flat` | Subtle grouping | Background color only |

### Padding

| Size | Value | Use Case |
|------|-------|----------|
| `none` | 0 | Custom internal layouts |
| `sm` | p-4 | Compact cards |
| `md` | p-6 | Default |
| `lg` | p-8 | Spacious content |

### Props

```typescript
interface CardProps {
  variant?: "default" | "elevated" | "outlined" | "flat";
  padding?: "none" | "sm" | "md" | "lg";
  title?: string;           // Optional header title
  subtitle?: string;        // Optional subtitle
  action?: ReactNode;       // Header action (right side)
  interactive?: boolean;    // Enables hover state
  onClick?: () => void;     // Makes card clickable
  children: ReactNode;
}
```

### Examples

```tsx
// Simple card
<Card>
  <p>Card content here</p>
</Card>

// With header
<Card title="Settings" subtitle="Manage preferences">
  <p>Settings content</p>
</Card>

// Clickable card
<Card variant="outlined" interactive onClick={handleClick}>
  <p>Click me</p>
</Card>

// Featured card
<Card variant="elevated" padding="lg">
  <h2>Premium Feature</h2>
</Card>
```

### Visual Reference

```
┌─────────────────────────────────────────────────────────────┐
│  DEFAULT             ELEVATED            OUTLINED           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │             │    │             │    │             │     │
│  │   Content   │    │   Content   │    │   Content   │     │
│  │             │    │             │    │             │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│  Subtle shadow      Large shadow       Border only         │
└─────────────────────────────────────────────────────────────┘
```

---

## Alert

**File:** `Alert.tsx`

Displays feedback messages to users.

### Variants

| Variant | Use Case | Color |
|---------|----------|-------|
| `error` | Errors, failures | Red |
| `success` | Successful actions | Green |
| `warning` | Cautionary messages | Amber |
| `info` | Informational | Blue |

### Props

```typescript
interface AlertProps {
  variant?: "error" | "success" | "warning" | "info";
  title?: string;           // Optional title above message
  icon?: IconKey;           // Custom icon (auto-selected by variant)
  hideIcon?: boolean;       // Hide the icon
  onClose?: () => void;     // Shows close button if provided
  action?: ReactNode;       // Action element on right
  children: ReactNode;      // Alert message
}
```

### Default Icons

| Variant | Icon |
|---------|------|
| error | `triangle-alert` |
| success | `check-circle` |
| warning | `triangle-alert` |
| info | `info` |

### Examples

```tsx
// Error alert
<Alert variant="error">
  Failed to save changes. Please try again.
</Alert>

// Dismissible success
<Alert variant="success" onClose={() => setShow(false)}>
  Your changes have been saved!
</Alert>

// With title and action
<Alert
  variant="warning"
  title="Session Expiring"
  action={<Button size="sm">Extend</Button>}
>
  Your session will expire in 5 minutes.
</Alert>
```

### Visual Reference

```
┌─────────────────────────────────────────────────────────────┐
│  ERROR                              SUCCESS                  │
│  ┌─────────────────────────────┐   ┌─────────────────────┐  │
│  │ ⚠ Error message here    ✕  │   │ ✓ Success message   │  │
│  └─────────────────────────────┘   └─────────────────────┘  │
│  Red background                    Green background          │
│                                                              │
│  WARNING                            INFO                     │
│  ┌─────────────────────────────┐   ┌─────────────────────┐  │
│  │ ⚠ Warning message here     │   │ ℹ Info message      │  │
│  └─────────────────────────────┘   └─────────────────────┘  │
│  Amber background                  Blue background           │
└─────────────────────────────────────────────────────────────┘
```

---

## LoadingSpinner

**File:** `LoadingSpinner.tsx`

Consistent loading indicator for async operations.

### Sizes

| Size | Dimensions | Use Case |
|------|------------|----------|
| `sm` | 16px (w-4) | Buttons, inline loading |
| `md` | 24px (w-6) | Default |
| `lg` | 32px (w-8) | Section loading |
| `xl` | 48px (w-12) | Full page loading |

### Variants

| Variant | Style |
|---------|-------|
| `spinner` | Classic rotating circle (default) |
| `dots` | Three bouncing dots |

### Props

```typescript
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "dots";
  message?: string;         // Loading message
  centered?: boolean;       // Center in container with padding
}
```

### Examples

```tsx
// Simple spinner
<LoadingSpinner />

// Page loading state
<LoadingSpinner size="lg" message="Loading settings..." centered />

// Full page loading (compound component)
<LoadingSpinner.Page message="Loading your dashboard..." />

// Inline/button loading
<LoadingSpinner size="sm" />
```

### Visual Reference

```
┌─────────────────────────────────────────────────────────────┐
│  SPINNER                    DOTS                            │
│       ◠                     ●  ●  ●                         │
│      ╱ ╲                   (bouncing)                       │
│     ╲   ╱                                                   │
│      ◡                                                      │
│  (rotating)                                                 │
│                                                             │
│  WITH MESSAGE:                                              │
│       ◠                                                     │
│      ╱ ╲                                                    │
│  Loading settings...                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## FormField

**File:** `FormField.tsx`

Consistent form input styling with label and error handling.

### Components

| Component | Use |
|-----------|-----|
| `FormField` (Input) | Text, email, password inputs |
| `FormField.Textarea` | Multi-line text |
| `FormField.Label` | Standalone label |

### Props

```typescript
interface InputProps {
  label?: string;           // Field label
  error?: string;           // Error message (shows error state)
  helperText?: string;      // Helper text below input
  wrapperClassName?: string;
  // ...all standard input props
}

interface TextareaProps {
  label?: string;
  error?: string;
  helperText?: string;
  rows?: number;            // Default: 3
  wrapperClassName?: string;
  // ...all standard textarea props
}
```

### Features

- Consistent focus ring (primary-500)
- Error state with red border
- Required indicator (red asterisk)
- Helper text support
- Disabled state styling
- Dark mode support

### Examples

```tsx
// Simple input
<FormField
  label="Email address"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="you@example.com"
/>

// With error
<FormField
  label="Password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  error="Password must be at least 8 characters"
/>

// Textarea
<FormField.Textarea
  label="Notes"
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  rows={4}
  helperText="Optional notes about this session"
/>

// Required field
<FormField
  label="Full Name"
  required
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

### Visual Reference

```
┌─────────────────────────────────────────────────────────────┐
│  NORMAL                         ERROR                        │
│  Email address                  Password                     │
│  ┌─────────────────────────┐   ┌─────────────────────────┐  │
│  │ you@example.com         │   │ ••••••••                │  │
│  └─────────────────────────┘   └─────────────────────────┘  │
│  Gray border                   Red border                    │
│                                Password must be 8+ chars     │
│                                                              │
│  FOCUSED                        REQUIRED                     │
│  Email address                  Full Name *                  │
│  ┌═════════════════════════┐   ┌─────────────────────────┐  │
│  │ you@example.com         │   │                         │  │
│  └═════════════════════════┘   └─────────────────────────┘  │
│  Purple ring                   Red asterisk                  │
└─────────────────────────────────────────────────────────────┘
```

---

## EmptyState

**File:** `EmptyState.tsx`

Displays a centered message when there's no data.

### Variants

| Variant | Use Case |
|---------|----------|
| `default` | Standard with icon circle |
| `minimal` | Simpler, no icon background |
| `card` | Wrapped in a card container |

### Props

```typescript
interface EmptyStateProps {
  variant?: "default" | "minimal" | "card";
  icon?: IconKey;           // Icon to display
  emoji?: string;           // Emoji alternative
  title: string;            // Main heading
  description?: string;     // Description text
  action?: ReactNode;       // Action button
  iconBgColor?: string;     // Custom icon background
  iconColor?: string;       // Custom icon color
}
```

### Examples

```tsx
// Simple empty state
<EmptyState
  icon="inbox"
  title="No messages"
  description="You don't have any messages yet."
/>

// With action
<EmptyState
  icon="gift"
  title="No rewards"
  description="Browse the catalog to find rewards."
  action={
    <Button onClick={() => navigate('/catalog')}>
      Browse Catalog
    </Button>
  }
/>

// Card variant
<EmptyState
  variant="card"
  icon="calendar"
  title="No sessions"
  description="Schedule your first revision session."
/>

// With emoji
<EmptyState
  emoji="🎉"
  title="All done!"
  description="You've completed all your tasks."
/>
```

### Visual Reference

```
┌─────────────────────────────────────────────────────────────┐
│  DEFAULT                                                     │
│                    ┌────────┐                               │
│                    │   📦   │  ← Icon in circle             │
│                    └────────┘                               │
│                   No items yet                              │
│           Add your first item to get started                │
│                                                             │
│                  ┌──────────────┐                           │
│                  │  Add Item    │  ← Action button          │
│                  └──────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Badge

**File:** `Badge.tsx`

Small status indicators, labels, and tags.

### Variants (Colors)

| Variant | Use Case | Color |
|---------|----------|-------|
| `default` | Neutral states | Gray |
| `primary` | Brand-related | Purple |
| `success` | Completed, on track | Green |
| `warning` | Needs attention | Amber |
| `danger` | Behind, error | Red |
| `info` | Informational | Blue |

### Sizes

| Size | Padding | Text Size |
|------|---------|-----------|
| `sm` | px-2 py-0.5 | text-xs |
| `md` | px-2.5 py-1 | text-xs |
| `lg` | px-3 py-1.5 | text-sm |

### Styles

| Style | Appearance |
|-------|------------|
| `solid` | Filled background, white text |
| `soft` | Light background, darker text (default) |
| `outline` | Border only, no fill |

### Props

```typescript
interface BadgeProps {
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  badgeStyle?: "solid" | "soft" | "outline";
  icon?: IconKey;           // Icon on left
  dot?: boolean;            // Show dot indicator
  children: ReactNode;
}
```

### Status Mapping Helper

```typescript
import { STATUS_TO_BADGE_VARIANT } from './Badge';

// Maps common status strings to variants:
// on_track, completed, active, approved → success
// needs_attention, pending, in_progress → warning
// behind, declined, failed, error → danger
// not_started, inactive, draft → default

<Badge variant={STATUS_TO_BADGE_VARIANT[status]}>
  {statusLabel}
</Badge>
```

### Examples

```tsx
// Simple status
<Badge variant="success">On Track</Badge>

// With icon
<Badge variant="warning" icon="clock">Pending</Badge>

// Outline style
<Badge variant="primary" badgeStyle="outline">New</Badge>

// With dot
<Badge variant="success" dot>Active</Badge>

// Solid style
<Badge variant="danger" badgeStyle="solid">Urgent</Badge>
```

### Visual Reference

```
┌─────────────────────────────────────────────────────────────┐
│  SOFT (default)                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Default  │ │ Success  │ │ Warning  │ │ Danger   │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│  Light bg      Green        Amber        Red                 │
│                                                              │
│  SOLID                                                       │
│  ┌██████████┐ ┌██████████┐ ┌██████████┐ ┌██████████┐        │
│  │ Default  │ │ Success  │ │ Warning  │ │ Danger   │        │
│  └██████████┘ └██████████┘ └██████████┘ └██████████┘        │
│  Filled bg, white text                                       │
│                                                              │
│  OUTLINE                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Default  │ │ Success  │ │ Warning  │ │ Danger   │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│  Border only, no fill                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## AppIcon

**File:** `AppIcon.tsx`

Centralized icon system built on Lucide icons.

### Usage

```tsx
import AppIcon from '../components/ui/AppIcon';

<AppIcon name="check" className="w-5 h-5 text-accent-green" />
```

### Icon Categories

| Category | Examples |
|----------|----------|
| Navigation | `arrow-left`, `arrow-right`, `chevron-down`, `x` |
| Actions | `plus`, `minus`, `pencil`, `trash-2`, `save` |
| Status | `check`, `check-circle`, `triangle-alert`, `info` |
| Time | `calendar`, `clock`, `hourglass` |
| Content | `book`, `lightbulb`, `graduation-cap` |
| Progress | `star`, `trophy`, `flame`, `rocket` |
| User | `user`, `log-out`, `lock`, `mail` |
| Subjects | `calculator`, `flask-conical`, `atom`, `globe` |

### Size Tokens

```tsx
import { ICON_SIZES } from '../constants/icons';

<AppIcon name="check" className={ICON_SIZES.sm} />  // w-4 h-4
<AppIcon name="star" className={ICON_SIZES.base} /> // w-5 h-5
<AppIcon name="trophy" className={ICON_SIZES.xl} /> // w-8 h-8
```

| Token | Size | Use Case |
|-------|------|----------|
| `xs` | 12px | Tiny badges |
| `sm` | 16px | Buttons, chips |
| `base` | 20px | Default |
| `lg` | 24px | Larger buttons |
| `xl` | 32px | Hero sections |
| `2xl` | 40px | Large cards |
| `3xl` | 48px | Very large UI |

See `DESIGN_TOKENS.md` for complete icon documentation.

---

## ThemeToggle

**File:** `ThemeToggle.tsx`

Theme switching component for light/dark mode.

### Variants

| Variant | Use Case |
|---------|----------|
| `icon` | Header icons |
| `button` | Settings pages |
| `switch` | Toggle style (default) |

### Usage

```tsx
import ThemeToggle from '../components/ui/ThemeToggle';

// Icon only (for headers)
<ThemeToggle variant="icon" />

// Full button (for settings)
<ThemeToggle variant="button" />

// Switch style
<ThemeToggle variant="switch" />
```

---

## Design Tokens Reference

All components use design tokens defined in:

- **CSS Variables:** `/src/styles/themes.css`
- **Tailwind Config:** `/tailwind.config.js`
- **JS Constants:** `/src/constants/colors.ts`

### Color Palette

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `primary-600` | #5B2CFF | #A890FF | Main brand, CTAs |
| `accent-green` | #1EC592 | - | Success |
| `accent-amber` | #FFB547 | - | Warning |
| `accent-red` | #F05151 | - | Danger |
| `accent-blue` | #5B8DEF | - | Info |
| `neutral-700` | #1F2330 | - | Primary text |
| `neutral-500` | #6B7280 | - | Secondary text |

### Spacing Scale

| Token | Value | Tailwind |
|-------|-------|----------|
| `spacing-1` | 4px | `p-1` |
| `spacing-2` | 8px | `p-2` |
| `spacing-4` | 16px | `p-4` |
| `spacing-6` | 24px | `p-6` |
| `spacing-8` | 32px | `p-8` |

### Border Radius

| Token | Value | Tailwind |
|-------|-------|----------|
| `radius-lg` | 8px | `rounded-lg` |
| `radius-xl` | 16px | `rounded-xl` |
| `radius-2xl` | 24px | `rounded-2xl` |

### Shadows

| Token | Use |
|-------|-----|
| `shadow-card` | Default card shadow |
| `shadow-card-hover` | Card hover state |
| `shadow-lg` | Elevated elements |

---

## Quick Import Reference

```tsx
// Import all UI components
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import FormField from '@/components/ui/FormField';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import AppIcon from '@/components/ui/AppIcon';
import ThemeToggle from '@/components/ui/ThemeToggle';
```

---

## Migration Guide

### Replacing Inline Buttons

**Before:**
```tsx
<button className="px-4 py-2 bg-brand-purple text-white rounded-xl hover:bg-brand-purple-dark">
  Save
</button>
```

**After:**
```tsx
<Button variant="primary">Save</Button>
```

### Replacing Inline Alerts

**Before:**
```tsx
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
    {error}
  </div>
)}
```

**After:**
```tsx
{error && <Alert variant="error">{error}</Alert>}
```

### Replacing Loading States

**Before:**
```tsx
<div className="flex items-center justify-center py-32">
  <div className="text-center">
    <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
    <p className="text-sm text-neutral-600">Loading...</p>
  </div>
</div>
```

**After:**
```tsx
<LoadingSpinner.Page message="Loading..." />
```

---

**Last Updated:** 2026-02-03
**Maintained By:** Development Team
