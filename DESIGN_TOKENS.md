# Design Token System

This document explains the design token system implemented in the Doorslam project.

## Overview

The project uses a centralized design token system built on CSS custom properties (CSS variables) that work seamlessly with Tailwind CSS. This provides:

- **Single source of truth** for design values
- **Dark mode support** via CSS class-based theming
- **Type-safe color constants** for JavaScript/TypeScript usage
- **Easy maintenance** - update tokens in one place
- **Consistent UI** across the entire application

## Architecture

### 1. CSS Custom Properties (`/src/styles/themes.css`)

The foundation of our design system. Defines all design tokens as CSS variables organized into:

#### Static Tokens (theme-independent)
```css
/* Spacing scale (4px grid) */
--spacing-1: 0.25rem;  /* 4px */
--spacing-4: 1rem;     /* 16px */
--spacing-12: 3rem;    /* 48px */

/* Typography */
--font-sans: Inter, system-ui, sans-serif;
--font-size-base: 1rem;
--font-weight-semibold: 600;

/* Border radius */
--radius-lg: 0.5rem;
--radius-xl: 1rem;

/* Shadows */
--shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.1);
```

#### Theme Tokens (light/dark mode)
```css
:root {
  /* Light mode (default) */
  --color-primary-600: #5B2CFF;
  --color-background: var(--color-neutral-0);
  --color-text-primary: var(--color-neutral-700);
}

.dark {
  /* Dark mode */
  --color-primary-600: #A890FF;
  --color-background: #0D0F14;
  --color-text-primary: var(--color-neutral-200);
}
```

### 2. Tailwind Configuration (`/tailwind.config.js`)

References CSS variables for all design tokens:

```javascript
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          600: 'var(--color-primary-600)',
          // ...
        },
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
      },
      // ...
    },
  },
};
```

### 3. JavaScript Constants (`/src/constants/colors.ts`)

For programmatic color access:

```typescript
export const COLORS = {
  primary: {
    600: "#5B2CFF",
    // ...
  },
  accent: {
    green: "#1EC592",
    amber: "#FFB547",
    red: "#F05151",
  },
} as const;
```

### 4. Theme Context (`/src/contexts/ThemeContext.tsx`)

Provides theme state management:

```typescript
const { theme, toggleTheme, setTheme } = useTheme();
```

## Usage

### Using Tailwind Classes (Recommended)

```tsx
// Colors
<div className="bg-primary-600 text-neutral-0">
  <p className="text-neutral-700">Primary text</p>
  <p className="text-neutral-500">Secondary text</p>
</div>

// Spacing
<div className="p-4 mb-6 gap-3">

// Shadows
<div className="shadow-card hover:shadow-card-hover">

// Border radius
<div className="rounded-xl">
```

### Using JavaScript Constants

For dynamic styles or charts:

```tsx
import { COLORS } from '../constants/colors';

<div style={{ backgroundColor: COLORS.primary[600] }}>

// For status-based colors
import { STATUS_COLORS } from '../constants/colors';

const color = STATUS_COLORS[status]; // 'on_track' → COLORS.accent.green
```

### Using CSS Variables Directly

When you need dynamic values in CSS-in-JS:

```tsx
<div style={{
  backgroundColor: 'var(--color-primary-600)',
  padding: 'var(--spacing-4)',
  borderRadius: 'var(--radius-xl)',
  boxShadow: 'var(--shadow-card)',
}}>
```

### Theme Toggle

#### Adding theme toggle to your component:

```tsx
import ThemeToggle from '../components/ui/ThemeToggle';

function Settings() {
  return (
    <div>
      {/* Icon only (for headers) */}
      <ThemeToggle variant="icon" />

      {/* Full button (for settings pages) */}
      <ThemeToggle variant="button" />

      {/* Switch style (default) */}
      <ThemeToggle variant="switch" />
    </div>
  );
}
```

#### Programmatic theme control:

```tsx
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
    </div>
  );
}
```

## Adding New Tokens

### 1. Add CSS Variable

In `/src/styles/themes.css`:

```css
:root {
  /* Add your new token */
  --color-brand-purple: #7C3AED;
  --spacing-custom: 2.5rem;
}

.dark {
  /* Override for dark mode if needed */
  --color-brand-purple: #A78BFA;
}
```

### 2. Reference in Tailwind

In `/tailwind.config.js`:

```javascript
colors: {
  brand: {
    purple: 'var(--color-brand-purple)',
  },
},
spacing: {
  'custom': 'var(--spacing-custom)',
},
```

### 3. Add to JavaScript Constants (if needed)

In `/src/constants/colors.ts`:

```typescript
export const COLORS = {
  // ...
  brand: {
    purple: "#7C3AED",
  },
} as const;
```

### 4. Use in Your Components

```tsx
<div className="bg-brand-purple p-custom">
  Brand colored box
</div>
```

## Color Palette Reference

### Primary (Brand Purple)
- `primary-50` to `primary-900` - Main brand colors
- Primary action color: `primary-600` (#5B2CFF)

### Neutral (Grays)
- `neutral-0` (white) to `neutral-900` (near black)
- Text colors: `neutral-700` (primary), `neutral-600` (secondary), `neutral-500` (tertiary)

### Accent Colors
- `accent-green` (#1EC592) - Success, completion
- `accent-amber` (#FFB547) - Warning, needs attention
- `accent-red` (#F05151) - Error, danger
- `accent-blue` (#5B8DEF) - Info, links

### Semantic Aliases
- `success` → `accent-green`
- `warning` → `accent-amber`
- `danger` → `accent-red`
- `info` → `accent-blue`

## Dark Mode

The dark mode system uses a class-based approach:

1. **Automatic**: ThemeProvider automatically applies `.dark` class to `<html>`
2. **Persistent**: Theme preference saved to localStorage
3. **System-aware**: Respects `prefers-color-scheme` media query
4. **Manual override**: User can manually toggle regardless of system preference

### Testing Dark Mode

```tsx
// In your component
<div className="bg-white dark:bg-neutral-800">
  <p className="text-neutral-700 dark:text-neutral-200">
    This text adapts to theme
  </p>
</div>
```

## Migration from Hardcoded Values

### Before (hardcoded):
```tsx
<div style={{ backgroundColor: '#5B2CFF', padding: '16px' }}>
  <p style={{ color: '#1F2330' }}>Text</p>
</div>
```

### After (design tokens):
```tsx
<div className="bg-primary-600 p-4">
  <p className="text-neutral-700">Text</p>
</div>
```

Or with JavaScript constants:
```tsx
import { COLORS } from '../constants/colors';

<div style={{ backgroundColor: COLORS.primary[600] }}>
  <p style={{ color: COLORS.neutral[700] }}>Text</p>
</div>
```

## Best Practices

1. **Prefer Tailwind classes** over inline styles when possible
2. **Use semantic color names** (`text-dark`, `bg-success`) over specific shades when appropriate
3. **Use JavaScript constants** for dynamic values, charts, or programmatic styling
4. **Test in both themes** when adding new components
5. **Add dark mode variants** for all color-related classes
6. **Use CSS variables** when you need dynamic runtime values

## Icon System

The project uses a centralized icon system built on Lucide icons. All icons are accessed through the `AppIcon` wrapper component for consistency and type safety.

### Architecture

#### 1. AppIcon Component (`/src/components/ui/AppIcon.tsx`)
Central icon wrapper that:
- Maps icon names (strings) to Lucide icon components
- Provides type safety via TypeScript
- Supports dynamic sizing and styling
- Contains 60+ icons organized by category

#### 2. Icon Constants (`/src/constants/icons.ts`)
Centralized icon utilities:
- **SUBJECT_ICON_MAP**: Database icon names → Lucide icon names
- **getSubjectIcon()**: Helper for subject icons with fallback
- **ICON_SIZES**: Consistent size tokens (xs, sm, base, lg, xl, 2xl, 3xl)
- **STATUS_ICONS**: Status state icon mappings
- **ICON_USAGE**: Documentation of icon usage patterns

### Basic Usage

```tsx
import AppIcon from '../components/ui/AppIcon';

// Basic icon
<AppIcon name="check" className="w-5 h-5 text-accent-green" />

// With sizing tokens (recommended)
import { ICON_SIZES } from '../constants/icons';

<AppIcon name="calendar" className={ICON_SIZES.base} />
<AppIcon name="star" className={ICON_SIZES.sm} />
```

### Subject Icons

For subject-specific icons (used in timetables, sessions, progress cards):

```tsx
import AppIcon from '../components/ui/AppIcon';
import { getSubjectIcon } from '../constants/icons';

// Get icon name for a subject
const iconName = getSubjectIcon(subject.icon); // "calculator", "flask-conical", etc.

<AppIcon name={iconName} className="w-6 h-6" style={{ color: subject.color }} />
```

**Subject Icon Mapping:**
- `calculator` → Calculator (Maths)
- `flask-conical` → Flask (Science, Chemistry)
- `atom` → Atom (Physics)
- `globe` → Globe (Geography)
- `landmark` → Landmark (History)
- `dna` → DNA (Biology)
- `languages` → Languages icon
- `book` → Book (English, default)
- `palette` → Palette (Art)
- `music` → Music note
- `laptop` → Laptop (Computing, ICT)
- `dumbbell` → Dumbbell (PE)
- `hands` → Hands (RE)
- `drama` → Drama masks
- And more... (see `/src/constants/icons.ts`)

### Icon Sizes

Use consistent sizing tokens:

```tsx
import { ICON_SIZES, getIconSize } from '../constants/icons';

// Direct usage
<AppIcon name="check" className={ICON_SIZES.sm} />  // w-4 h-4 (16px)
<AppIcon name="star" className={ICON_SIZES.base} /> // w-5 h-5 (20px)
<AppIcon name="trophy" className={ICON_SIZES.xl} /> // w-8 h-8 (32px)

// Or use helper function
<AppIcon name="check" className={getIconSize('sm')} />
```

**Size Reference:**
- `xs` = 12px - Tiny badges, inline text
- `sm` = 16px - Buttons, chips, small cards
- `base` = 20px - Default size, most UI elements
- `lg` = 24px - Larger buttons, prominent icons
- `xl` = 32px - Hero sections, empty states
- `2xl` = 40px - Large cards, avatars
- `3xl` = 48px - Very large UI elements

### Status Icons

For status indicators:

```tsx
import { getStatusIcon } from '../constants/icons';

const statusIcon = getStatusIcon('completed');     // "check-circle"
const statusIcon = getStatusIcon('in_progress');   // "clock"
const statusIcon = getStatusIcon('on_track');      // "check-circle"
const statusIcon = getStatusIcon('behind');        // "flame"

<AppIcon name={statusIcon} className={ICON_SIZES.base} />
```

### Available Icons by Category

#### Navigation & Actions
`arrow-left`, `arrow-right`, `chevron-down`, `chevron-right`, `plus`, `minus`, `x`, `pencil`, `trash-2`, `save`, `search`, `sliders-horizontal`

#### Time & Schedule
`calendar`, `calendar-check`, `calendar-clock`, `calendar-x`, `clock`, `hourglass`

#### Status & Feedback
`check`, `check-circle`, `check-double`, `circle`, `triangle-alert`, `info`, `loader`, `eye`, `eye-off`

#### Content & Learning
`book`, `book-open`, `lightbulb`, `graduation-cap`, `message-circle`, `heart`

#### Progress & Achievement
`star`, `trophy`, `flame`, `rocket`, `sprout`, `target`, `trending-up`, `trending-down`

#### User & Account
`user`, `user-plus`, `log-out`, `lock`, `unlock`, `shield`, `key`, `mail`

#### Rewards
`gift`, `coins`, `wallet`, `crown`, `ticket`, `candy`

#### Theme
`sun`, `moon`

#### Subject Icons
`calculator`, `flask-conical`, `atom`, `globe`, `landmark`, `dna`, `languages`, `palette`, `music`, `microscope`, `laptop`, `dumbbell`, `hands`, `drama`, `leaf`, `utensils`, `scale`, `person-standing`, `guitar`

### Migration from FontAwesome

All FontAwesome icons have been migrated to Lucide. Icon names changed:
- `faTimes` → `"x"`
- `faPlus` → `"plus"`
- `faCheck` → `"check"`
- `faArrowRight` → `"arrow-right"`
- `faCalculator` → `"calculator"`
- `faFlask` → `"flask-conical"`

### Best Practices

1. **Use AppIcon** for all icons - don't import Lucide directly
2. **Use size tokens** (`ICON_SIZES`) for consistency
3. **Use helper functions** (`getSubjectIcon`, `getStatusIcon`) for dynamic icons
4. **Type safety** - all icon names are type-checked
5. **Test in both themes** - ensure icons work in light and dark mode

## Files Modified

### Created:
- `/src/styles/themes.css` - CSS custom properties (spacing, colors, typography, shadows)
- `/src/contexts/ThemeContext.tsx` - Theme state management with localStorage persistence
- `/src/components/ui/ThemeToggle.tsx` - Theme toggle component (3 variants)
- `/src/constants/icons.ts` - Centralized icon system (subject icons, status icons, size tokens)

### Updated:
#### Theme System:
- `/tailwind.config.js` - References CSS variables, added `darkMode: 'class'`
- `/src/Main.tsx` - Imports themes.css, wraps app with ThemeProvider
- `/index.html` - Removed FontAwesome CDN link

#### Icon System:
- `/src/components/ui/AppIcon.tsx` - Added 30+ new icons (subject icons, sun, moon, search, etc.)
- `/src/components/layout/AppHeader.tsx` - Added theme toggle next to avatar
- `/src/components/timetable/TimetableHeroCard.tsx` - Uses centralized `getSubjectIcon`
- `/src/components/timetable/TodayView.tsx` - Uses centralized `getSubjectIcon`
- `/src/components/child/today/SessionList.tsx` - Uses centralized `getSubjectIcon`
- `/src/services/child/summarystep.ts` - Uses centralized `getSubjectIcon`
- `/src/services/child/completestep.ts` - Migrated from FontAwesome to Lucide, uses centralized icons
- `/src/services/child/previewstep.ts` - Migrated from FontAwesome to Lucide, uses centralized icons
- `/src/utils/child/sessionUtils.ts` - Migrated from FontAwesome to Lucide, uses centralized icons
- `/src/types/child/completestep/completeStepTypes.ts` - Changed `icon: IconDefinition` to `icon: string`
- `/src/types/child/previewstep/previewStepTypes.ts` - Changed `icon: IconDefinition` to `icon: string`

### Removed:
- All `@fortawesome` imports and dependencies from npm packages
- Duplicate ICON_MAP definitions across components (now centralized)
- FontAwesome CDN link from index.html

### Legacy (Maintained):
- `/src/constants/colors.ts` - Backward compatibility and programmatic color access
- `/src/utils/iconMap.ts` - Small legacy file (can be deprecated in favor of `/src/constants/icons.ts`)

## Troubleshooting

### Colors not updating in dark mode
- Ensure ThemeProvider wraps your app in Main.tsx
- Check that `.dark` class is applied to `<html>` element
- Verify you're using Tailwind's `dark:` variants

### CSS variable not found
- Check that themes.css is imported in Main.tsx
- Verify the variable name matches between themes.css and tailwind.config.js
- Clear build cache and restart dev server

### TypeScript errors with colors
- Import from `/src/constants/colors.ts` for type-safe color access
- Use `as const` assertion for color objects

## Future Enhancements

- [ ] Add system theme detection toggle
- [ ] Expand color palette for additional accent colors
- [ ] Add animation/transition token scales
- [ ] Create theme preview/builder tool
- [ ] Add component-specific token documentation
