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

## 7. Code Connect

Code Connect links each Figma component to its React source file. Once published, Figma's Dev Mode shows a live code snippet — with the correct props already filled in — whenever a developer inspects an instance. No more guessing component names or prop spellings.

### What it unlocks

- **Dev Mode snippet panel** — inspect any instance in Figma, see `<Button variant="primary" size="md">Label</Button>` ready to copy
- **Prop mapping** — Figma variant properties map to React props; switching the variant in Figma updates the snippet automatically
- **Import path** — each snippet shows the exact import line for the project
- **Storybook integration** — Code Connect also works as a bridge to Storybook if that is added later

---

### Prerequisites

```bash
# Install the Figma Code Connect CLI (once per machine or CI)
npm install --save-dev @figma/code-connect

# Authenticate (generates ~/.config/figma/credentials.json)
npx figma connect auth
```

The CLI needs a personal access token with **File content (read)** and **Code Connect (write)** scopes. Generate one at figma.com → Settings → Personal access tokens.

---

### Project config

Create `figma.config.json` at the repo root (next to `package.json`):

```json
{
  "codeConnect": {
    "react": {
      "importPaths": {
        "src/components/ui/*": "@/components/ui/*",
        "src/components/child/session/*": "@/components/child/session/*"
      }
    }
  }
}
```

This tells the CLI how to rewrite import paths in generated snippets so they match the project's `@/` alias.

---

### Connection files

Each component needs a `.figma.tsx` file alongside its source. The file declares:
1. The Figma file key and node ID to connect to
2. The React component to use
3. A `props` mapping from Figma variant properties → React prop values
4. An example render that the snippet panel will display

**File key:** `TSeO2EF4ijKMzrp4LVaCr7`

---

#### Button — `src/components/ui/Button.figma.tsx`

```tsx
import figma from "@figma/code-connect";
import { Button } from "./Button";

figma.connect(Button, "figma.com/design/TSeO2EF4ijKMzrp4LVaCr7?node-id=2979-54040", {
  props: {
    variant: figma.enum("Variant", {
      primary:   "primary",
      secondary: "secondary",
      ghost:     "ghost",
      danger:    "danger",
    }),
    size: figma.enum("Size", {
      sm: "sm",
      md: "md",
      lg: "lg",
    }),
  },
  example: ({ variant, size }) => (
    <Button variant={variant} size={size}>Label</Button>
  ),
});
```

---

#### Badge — `src/components/ui/Badge.figma.tsx`

> Note: The Figma variant property is `Style` but the React prop is `badgeStyle`.

```tsx
import figma from "@figma/code-connect";
import { Badge } from "./Badge";

figma.connect(Badge, "figma.com/design/TSeO2EF4ijKMzrp4LVaCr7?node-id=2979-54077", {
  props: {
    variant: figma.enum("Variant", {
      default: "default",
      primary: "primary",
      success: "success",
      warning: "warning",
      danger:  "danger",
      info:    "info",
    }),
    badgeStyle: figma.enum("Style", {
      soft:    "soft",
      solid:   "solid",
      outline: "outline",
    }),
  },
  example: ({ variant, badgeStyle }) => (
    <Badge variant={variant} badgeStyle={badgeStyle}>Label</Badge>
  ),
});
```

---

#### Alert — `src/components/ui/Alert.figma.tsx`

> Note: The `Title=yes` variant maps to passing a `title` string prop; `Title=no` omits it.

```tsx
import figma from "@figma/code-connect";
import { Alert } from "./Alert";

figma.connect(Alert, "figma.com/design/TSeO2EF4ijKMzrp4LVaCr7?node-id=2979-54100", {
  props: {
    variant: figma.enum("Variant", {
      error:   "error",
      success: "success",
      warning: "warning",
      info:    "info",
    }),
    title: figma.enum("Title", {
      yes: "Alert title",
      no:  undefined,
    }),
  },
  example: ({ variant, title }) => (
    <Alert variant={variant} title={title}>Message goes here.</Alert>
  ),
});
```

---

#### Card — `src/components/ui/Card.figma.tsx`

```tsx
import figma from "@figma/code-connect";
import { Card } from "./Card";

figma.connect(Card, "figma.com/design/TSeO2EF4ijKMzrp4LVaCr7?node-id=2979-54113", {
  props: {
    variant: figma.enum("Variant", {
      default:  "default",
      elevated: "elevated",
      outlined: "outlined",
      flat:     "flat",
    }),
  },
  example: ({ variant }) => (
    <Card variant={variant}>Content</Card>
  ),
});
```

---

#### Progress Bar — `src/components/ui/ProgressBar.figma.tsx`

> Note: Figma uses `Color=destructive` which maps to React's `color="danger"` (the prop type is `ProgressBarColor`).

```tsx
import figma from "@figma/code-connect";
import { ProgressBar } from "./ProgressBar";

figma.connect(ProgressBar, "figma.com/design/TSeO2EF4ijKMzrp4LVaCr7?node-id=2979-54180", {
  props: {
    color: figma.enum("Color", {
      primary:     "primary",
      success:     "success",
      warning:     "warning",
      destructive: "danger",
    }),
    size: figma.enum("Size", {
      sm: "sm",
      md: "md",
      lg: "lg",
    }),
  },
  example: ({ color, size }) => (
    <ProgressBar value={65} color={color} size={size} />
  ),
});
```

---

#### Empty State — `src/components/ui/EmptyState.figma.tsx`

```tsx
import figma from "@figma/code-connect";
import { EmptyState } from "./EmptyState";

figma.connect(EmptyState, "figma.com/design/TSeO2EF4ijKMzrp4LVaCr7?node-id=2979-54149", {
  props: {
    variant: figma.enum("Variant", {
      default: "default",
      minimal: "minimal",
    }),
  },
  example: ({ variant }) => (
    <EmptyState variant={variant} icon="inbox" title="Nothing here yet" description="Add something to get started." />
  ),
});
```

---

#### Icon Circle — `src/components/ui/IconCircle.figma.tsx`

> Note: Figma uses `Color=muted`; the React prop type maps this to `color="neutral"`.

```tsx
import figma from "@figma/code-connect";
import { IconCircle } from "./IconCircle";

figma.connect(IconCircle, "figma.com/design/TSeO2EF4ijKMzrp4LVaCr7?node-id=2979-54907", {
  props: {
    color: figma.enum("Color", {
      primary:     "primary",
      success:     "success",
      warning:     "warning",
      destructive: "danger",
      info:        "info",
      muted:       "neutral",
    }),
    size: figma.enum("Size", {
      lg: "lg",
      xl: "xl",
    }),
  },
  example: ({ color, size }) => (
    <IconCircle icon="star" color={color} size={size} />
  ),
});
```

---

#### Circular Progress — `src/components/ui/CircularProgress.figma.tsx`

```tsx
import figma from "@figma/code-connect";
import { CircularProgress } from "./CircularProgress";

figma.connect(CircularProgress, "figma.com/design/TSeO2EF4ijKMzrp4LVaCr7?node-id=2979-54968", {
  props: {
    color: figma.enum("Color", {
      primary:     "primary",
      success:     "success",
      warning:     "warning",
      destructive: "danger",
      info:        "info",
    }),
    size: figma.enum("Size", {
      lg: "lg",
      xl: "xl",
    }),
  },
  example: ({ color, size }) => (
    <CircularProgress value={72} color={color} size={size} />
  ),
});
```

---

#### Stat Card — `src/components/ui/StatCard.figma.tsx`

```tsx
import figma from "@figma/code-connect";
import { StatCard } from "./StatCard";

figma.connect(StatCard, "figma.com/design/TSeO2EF4ijKMzrp4LVaCr7?node-id=2979-55049", {
  props: {
    size: figma.enum("Size", {
      sm: "sm",
      md: "md",
      lg: "lg",
    }),
  },
  example: ({ size }) => (
    <StatCard label="Total Sessions" value={128} size={size} />
  ),
});
```

---

#### Avatar Circle — `src/components/ui/AvatarCircle.figma.tsx`

```tsx
import figma from "@figma/code-connect";
import { AvatarCircle } from "./AvatarCircle";

figma.connect(AvatarCircle, "figma.com/design/TSeO2EF4ijKMzrp4LVaCr7?node-id=2979-55036", {
  props: {
    size: figma.enum("Size", {
      xs: "xs",
      sm: "sm",
      md: "md",
      lg: "lg",
      xl: "xl",
    }),
  },
  example: ({ size }) => (
    <AvatarCircle initials="JD" size={size} />
  ),
});
```

---

#### Theme Toggle — `src/components/ui/ThemeToggle.figma.tsx`

> The Figma `Mode` property is presentational only — the React component reads from a theme context. No prop mapping needed; the snippet shows the plain usage.

```tsx
import figma from "@figma/code-connect";
import ThemeToggle from "./ThemeToggle";

figma.connect(ThemeToggle, "figma.com/design/TSeO2EF4ijKMzrp4LVaCr7?node-id=2979-55059", {
  example: () => <ThemeToggle />,
});
```

---

#### Ask AI Tutor Button — `src/components/ui/AskAITutorButton.figma.tsx`

> Note: Figma variant `Width=full` maps to React prop `fullWidth={true}`.

```tsx
import figma from "@figma/code-connect";
import AskAITutorButton from "./AskAITutorButton";

figma.connect(AskAITutorButton, "figma.com/design/TSeO2EF4ijKMzrp4LVaCr7?node-id=2979-55066", {
  props: {
    fullWidth: figma.enum("Width", {
      default: false,
      full:    true,
    }),
  },
  example: ({ fullWidth }) => (
    <AskAITutorButton fullWidth={fullWidth} onClick={() => {}} />
  ),
});
```

---

#### Section Header — `src/components/child/session/SectionHeader.figma.tsx`

> The `Description=yes/no` variant is presentational — in React the description is a string prop. The snippet shows both cases.

```tsx
import figma from "@figma/code-connect";
import { SectionHeader } from "./SectionHeader";

figma.connect(SectionHeader, "figma.com/design/TSeO2EF4ijKMzrp4LVaCr7?node-id=2979-54980", {
  props: {
    description: figma.enum("Description", {
      yes: "Supporting context for this section.",
      no:  undefined,
    }),
  },
  example: ({ description }) => (
    <SectionHeader icon="gauge" title="Section Title" description={description} />
  ),
});
```

---

#### Step Intro Screen — `src/components/child/session/StepIntroScreen.figma.tsx`

```tsx
import figma from "@figma/code-connect";
import { StepIntroScreen } from "./StepIntroScreen";

figma.connect(StepIntroScreen, "figma.com/design/TSeO2EF4ijKMzrp4LVaCr7?node-id=2979-54981", {
  example: () => (
    <StepIntroScreen
      icon="pencil"
      title="Time to practise!"
      description={<>Learn about <span className="font-semibold text-primary">Topic Name</span>.</>}
      detail="3 questions ready"
      buttonLabel="Let's go!"
      onStart={() => {}}
    />
  ),
});
```

---

#### Confidence Selector — `src/components/child/session/ConfidenceSelector.figma.tsx`

```tsx
import figma from "@figma/code-connect";
import { ConfidenceSelector } from "./ConfidenceSelector";
import { CONFIDENCE_OPTIONS } from "./constants";

figma.connect(ConfidenceSelector, "figma.com/design/TSeO2EF4ijKMzrp4LVaCr7?node-id=2979-55015", {
  props: {
    variant: figma.enum("Variant", {
      list: "list",
      grid: "grid",
    }),
  },
  example: ({ variant }) => (
    <ConfidenceSelector
      options={CONFIDENCE_OPTIONS}
      selected={null}
      onSelect={() => {}}
      variant={variant}
    />
  ),
});
```

---

### Prop mapping reference

A summary of every place where the Figma variant property name or value differs from the React prop:

| Component | Figma property | Figma value | React prop | React value |
|-----------|---------------|-------------|------------|-------------|
| Badge | `Style` | `soft` / `solid` / `outline` | `badgeStyle` | unchanged |
| Alert | `Title` | `yes` | `title` | `"Alert title"` (string) |
| Alert | `Title` | `no` | `title` | omitted |
| ProgressBar | `Color` | `destructive` | `color` | `"danger"` |
| IconCircle | `Color` | `muted` | `color` | `"neutral"` |
| IconCircle | `Color` | `destructive` | `color` | `"danger"` |
| CircularProgress | `Color` | `destructive` | `color` | `"danger"` |
| AskAITutorButton | `Width` | `full` | `fullWidth` | `true` |
| AskAITutorButton | `Width` | `default` | `fullWidth` | `false` (or omitted) |
| ThemeToggle | `Mode` | — | — | no prop (reads context) |
| SectionHeader | `Description` | `yes` / `no` | `description` | string / omitted |

---

### Publishing

Once the `.figma.tsx` files exist, publish with:

```bash
# Dry run — shows what will be published without writing to Figma
npx figma connect publish --dry-run

# Publish all connections
npx figma connect publish
```

To publish only specific files:
```bash
npx figma connect publish src/components/ui/Button.figma.tsx
```

To remove all published connections (e.g. before a full re-publish):
```bash
npx figma connect unpublish
```

---

### CI integration

Add to `.github/workflows/figma-code-connect.yml` to auto-publish on every merge to `main`:

```yaml
name: Figma Code Connect

on:
  push:
    branches: [main]
    paths:
      - "src/**/*.figma.tsx"

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx figma connect publish
        env:
          FIGMA_ACCESS_TOKEN: ${{ secrets.FIGMA_ACCESS_TOKEN }}
```

Add `FIGMA_ACCESS_TOKEN` as a repository secret with the same personal access token used for local auth.

---

### What developers see in Dev Mode

Once published, selecting any component instance in Figma Dev Mode shows:

```
Code  ←  active tab in the right panel

import { Button } from "@/components/ui/Button";

<Button variant="primary" size="md">
  Label
</Button>
```

Switching the variant in Figma (e.g. to `Variant=ghost, Size=sm`) immediately updates the snippet to:

```tsx
<Button variant="ghost" size="sm">
  Label
</Button>
```

---

## 8. Files touched

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
