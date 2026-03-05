# Figma Design System Handoff

**File:** Doorslam - Design System Variables
**File Key:** `TSeO2EF4ijKMzrp4LVaCr7`
**Date completed:** 2026-03-05
**Scope:** Text styles, 16 component sets, Design Guidelines reference page

---

## Overview

The entire DoorSlam component library was extracted from the live React/TypeScript codebase and rebuilt as native Figma components. The result is a fully connected design system where:

- All Figma components use **variable-bound colour tokens** (light/dark mode aware)
- All text nodes are **connected to named text styles**
- All component instances on the Design Guidelines page are **live references** — editing the component updates every instance automatically

---

## 1. Text Styles

### Source of truth
`src/styles/themes.css` — all font sizes, weights, and the `DM Sans` font family are defined here as CSS custom properties.

### What was created
25 text styles under the `DoorSlam/` namespace in Figma:

| Token | Size | Weights |
|-------|------|---------|
| `2xs` | 10px | Regular, Medium, SemiBold, Bold |
| `xs`  | 12px | Regular, Medium, SemiBold, Bold |
| `sm`  | 14px | Regular, Medium, SemiBold, Bold |
| `base`| 16px | Regular, Medium, SemiBold, Bold |
| `lg`  | 18px | Regular, Medium, SemiBold, Bold |
| `xl`  | 20px | Regular, SemiBold |
| `2xl` | 24px | Regular, SemiBold |
| `3xl` | 30px | Regular, SemiBold |
| `4xl` | 36px | Regular, SemiBold |

**Line heights:** Tight headings use 125%, body text uses 150% — matching the `themes.css` token values.

### Text node coverage
- **540 text nodes** scanned across all component sets on the Components page
- **523 nodes** connected to a DoorSlam text style
- **9 intentional outliers** (8px, 9px, 40px, 72px one-off sizes with no matching token — left unstyled)
- **8 mixed-content nodes** (rich text with inline formatting — cannot bind a single style, left as-is)

### Non-standard size corrections applied
Components originally built with sizes outside the token scale were snapped to the nearest token before style application:

| Original | Corrected to |
|----------|-------------|
| 11px | 12px (xs) |
| 13px | 14px (sm) |
| 15px | 14px (sm) |
| 17px | 18px (lg) |
| 22px | 24px (2xl) |
| 32px | 30px (3xl) |

---

## 2. Colour Variables

All colours are bound to Figma variables sourced from `src/styles/themes.css`. The variable collection has **Light** and **Dark** modes — toggling the mode on any frame updates every component inside it simultaneously.

Key token groups:
- `--primary-*` (50→950 scale, 10 shades)
- `--background`, `--foreground`, `--muted`, `--border`, `--card`
- `--success`, `--warning`, `--destructive`, `--info` (semantic)
- Subject palette (10 slots, mapped by `sort_order` not subject name)

---

## 3. Components

All 16 component sets live on the **Components** page. Each is a `COMPONENT_SET` with variants matching the props defined in the React source.

### Naming convention
Variant names follow the pattern `Prop=value, Prop=value` e.g. `Variant=primary, Size=md`.

---

### Component inventory

#### Atoms

| Component | Figma Node ID | Variants | Source file |
|-----------|--------------|----------|-------------|
| **Button** | `2979:54040` | `Variant` × 4 (primary/secondary/ghost/danger), `Size` × 3 (sm/md/lg) | `src/components/ui/Button.tsx` |
| **Badge** | `2979:54077` | `Variant` × 6 (default/primary/success/warning/danger/info), `Style` × 3 (soft/solid/outline) | `src/components/ui/Badge.tsx` |
| **Progress Bar** | `2979:54180` | `Color` × 4 (primary/success/warning/destructive), `Size` × 3 (sm/md/lg) | `src/components/ui/ProgressBar.tsx` |
| **Icon Circle** | `2979:54907` | `Color` × 6 (primary/success/warning/destructive/info/muted), `Size` × 2 (lg/xl) | `src/components/ui/IconCircle.tsx` |
| **Circular Progress** | `2979:54968` | `Color` × 5 (primary/success/warning/destructive/info), `Size` × 2 (lg/xl) | `src/components/ui/CircularProgress.tsx` |
| **Avatar Circle** | `2979:55036` | `Type` × 2 (Initials/Placeholder), `Size` × 5 (xs/sm/md/lg/xl) | `src/components/ui/AvatarCircle.tsx` |

#### Molecules

| Component | Figma Node ID | Variants | Source file |
|-----------|--------------|----------|-------------|
| **Alert** | `2979:54100` | `Variant` × 4 (error/success/warning/info), `Title` × 2 (no/yes) | `src/components/ui/Alert.tsx` |
| **Card** | `2979:54113` | `Variant` × 4 (default/elevated/outlined/flat) | `src/components/ui/Card.tsx` |
| **Form Field** | `2979:54140` | `Type` × 2 (input/textarea), `State` × 3 (default/error/disabled) | `src/components/ui/FormField.tsx` |
| **Empty State** | `2979:54149` | `Variant` × 2 (default/minimal) | `src/components/ui/EmptyState.tsx` |
| **Stat Card** | `2979:55049` | `Size` × 3 (sm/md/lg) | `src/components/ui/StatCard.tsx` |

#### Organisms / Session

| Component | Figma Node ID | Variants | Source file |
|-----------|--------------|----------|-------------|
| **Theme Toggle** | `2979:55059` | `Mode` × 3 (light/system/dark) | `src/components/ui/ThemeToggle.tsx` |
| **Ask AI Tutor Button** | `2979:55066` | `Width` × 2 (default/full) | `src/components/ui/AskAITutorButton.tsx` |
| **Section Header** | `2979:54980` | `Description` × 2 (yes/no) | `src/components/child/session/SectionHeader.tsx` |
| **Step Intro Screen** | `2979:54981` | Single component (no variants) | `src/components/child/session/StepIntroScreen.tsx` |
| **Confidence Selector** | `2979:55015` | `Variant` × 2 (list/grid) | `src/components/child/session/ConfidenceSelector.tsx` |

---

## 4. Design Guidelines Page

A reference page built entirely from live component instances — no static graphics.

**Frame:** `2986:29836` — "Design Guidelines" (1440 × 10,259px) on the **Guidelines** page.
**Main content column:** `2986:29842` — Auto-layout vertical frame, 1020px wide.

### Page structure

```
Design Guidelines (1440 × 10259px)
├── Header bar (1440 × 80px)
│   └── "Design Guidelines" title + active tab pill
├── Sidebar Nav (200px wide, fixed position)
│   ├── Tokens: Colors, Typography
│   ├── Atoms: Button, Badge, Progress Bar, Icon Circle, Circular Progress, Avatar Circle
│   ├── Molecules: Alert, Card, Form Field, Empty State, Stat Card
│   └── Organisms: Theme Toggle, Ask AI Tutor, Section Header, Step Intro Screen, Confidence Selector
└── Main Content (1020px wide, auto-layout vertical)
    ├── Colors — primary palette, accent/semantic, subject palette
    ├── Typography — font size scale, font weight samples
    ├── [Components divider + intro]
    ├── Button — 4 variants, 3 sizes
    ├── Badge — 6 variants × 3 styles, status conventions
    ├── Alert — 4 variants × with/without title
    ├── Card — 4 variants
    ├── Form Field — input + textarea × 3 states
    ├── Empty State — default + minimal
    ├── Progress Bar — 4 colors + 3 sizes
    ├── Stat Card — 3 sizes
    ├── Icon Circle — 6 colors + 2 sizes
    ├── Circular Progress — 5 colors + 2 sizes
    ├── Avatar Circle — Initials + Placeholder × 5 sizes
    ├── Theme Toggle — 3 modes
    ├── Ask AI Tutor Button — default + full width
    ├── Section Header — with/without description
    ├── Step Intro Screen — single variant
    └── Confidence Selector — list + grid
```

---

## 5. Key Technical Decisions

### Why component sets not frames
Each variant is a `COMPONENT` inside a `COMPONENT_SET`. This means:
- Instances can swap variants via the right panel without detaching
- Overrides persist when swapping variants within the same set
- Dev Mode shows the correct component name and variant props

### Colour opacity
All semi-transparent fills use `hexToRgba(color, alpha)` from `src/utils/colorUtils.ts`. String concatenation like `${color}20` is never used — it breaks when the token value changes.

### Subject colours
Subject palette colours are assigned by `sort_order` (position the subject was added to a plan), not by subject name. See `src/constants/colors.ts` → `SUBJECT_PALETTE` and `src/utils/colorUtils.ts` → `buildSubjectColorMap`.

### Dark mode
All components bind to semantic variable aliases (`--background`, `--foreground`, etc.) rather than raw hex values. Switching a frame to Dark mode in Figma re-resolves all tokens automatically — no manual re-colouring needed.

---

## 6. How to use in new designs

### Instantiating a component
1. Open the **Assets** panel → **Components** page
2. Drag any component onto your frame
3. Use the **Design** panel to swap variants (Variant, Size, State etc.)

### Switching modes
Select any frame → **Design panel** → **Variables** section → change the collection mode from Light to Dark.

### Adding new tokens
1. Add the CSS custom property to `src/styles/themes.css`
2. Add the corresponding Figma variable to the collection with matching Light/Dark values
3. Bind it to any new fill/stroke/text in the component

### Extending components
When adding new props to a React component, add the corresponding variant to the Figma `COMPONENT_SET` and name it with the same `Prop=value` pattern. This keeps the naming aligned for Code Connect mapping in future.

---

## 7. Files touched

| File | What changed |
|------|-------------|
| `src/styles/themes.css` | Source of truth for all tokens — no changes made, read-only reference |
| `src/constants/colors.ts` | Read for `SUBJECT_PALETTE` definition |
| `src/utils/colorUtils.ts` | Read for `buildSubjectColorMap` and `hexToRgba` patterns |
| `src/views/parent/DesignGuidelines.tsx` | Read as blueprint for the Figma reference page layout |
| `src/components/ui/*.tsx` | Read for component prop/variant structure |
| `src/components/child/session/*.tsx` | Read for session component prop/variant structure |
| **Figma — Components page** | 16 component sets created; 523 text nodes connected to styles |
| **Figma — Guidelines page** | "Design Guidelines" frame built from scratch using component instances |
