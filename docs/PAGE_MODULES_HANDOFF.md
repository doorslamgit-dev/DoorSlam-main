# Page Modules Handoff — DoorSlam

**File:** Doorslam - Design System Variables
**File Key:** `TSeO2EF4ijKMzrp4LVaCr7`
**Figma Link:** https://www.figma.com/design/TSeO2EF4ijKMzrp4LVaCr7
**Date completed:** 2026-03-08
**Scope:** 7 page module sections, 30 sub-sections, Code Connect mappings reference, variable bindings

---

## Overview

The **Page Modules** page in the Figma design system documents every major UI section of the DoorSlam parent-facing application. Each section contains annotated mockups showing real component instances, live DoorSlam Token variable bindings, and Code Connect mappings back to the React source files.

Key characteristics:
- All frames use **DoorSlam Token** variables for colours (light/dark mode aware)
- All component instances are live — they reflect the actual `Components` page component sets
- **31 Code Connect mappings** defined below, linking Figma node IDs to TypeScript source files
- Subject-colour fills use the **subject palette transparency variables** (`subject/N-name 10%`, `subject/N-name 12%`)

---

## Variable Collection

**Collection:** `DoorSlam Tokens`
**Collection ID:** `VariableCollectionId:2979:53931`
**Modes:** Light (`2979:0`), Dark (`2979:1`)

### Transparency Variables in Use

The following transparency variables are defined in `DoorSlam Tokens` and actively used in Page Module fills:

#### Semantic 10% Transparencies
| Variable | Value | Variable ID |
|---|---|---|
| `color/primary 10%` | rgba(79, 70, 229, 10%) | `VariableID:2991:21794` |
| `color/success 10%` | rgba(132, 204, 22, 10%) | `VariableID:2991:21790` |
| `color/warning 10%` | rgba(217, 119, 6, 10%) | `VariableID:2991:21791` |
| `color/destructive 10%` | rgba(225, 29, 72, 10%) | `VariableID:2991:21792` |
| `color/info 10%` | rgba(6, 182, 212, 10%) | `VariableID:2991:21793` |
| `color/muted-foreground 10%` | rgba(107, 114, 128, 10%) | `VariableID:2991:21811` |

#### Subject Palette Transparencies
All 10 subject colours at both 10% and 12% opacity. Variable IDs `VariableID:3035:52087` → `VariableID:3035:52106`.

| Variable Group | 10% Hex | 12% Hex |
|---|---|---|
| `subject/0-purple` | `#5B2CFF1A` | `#5B2CFF1F` |
| `subject/1-red` | `#EF44441A` | `#EF44441F` |
| `subject/2-orange` | `#F973161A` | `#F973161F` |
| `subject/3-amber` | `#F59E0B1A` | `#F59E0B1F` |
| `subject/4-lime` | `#84CC161A` | `#84CC161F` |
| `subject/5-emerald` | `#10B9811A` | `#10B9811F` |
| `subject/6-teal` | `#14B8A61A` | `#14B8A61F` |
| `subject/7-blue` | `#3B82F61A` | `#3B82F61F` |
| `subject/8-violet` | `#A855F71A` | `#A855F71F` |
| `subject/9-pink` | `#EC48991A` | `#EC48991F` |

> **Note on subject palette:** Colours are assigned by `sort_order` (the position a subject appears in the plan), NOT by subject name. See `src/constants/colors.ts` → `SUBJECT_PALETTE` and `src/utils/colorUtils.ts` → `buildSubjectColorMap()`.

### Unbound Fills (by design)
The following fills could not be bound to variables and are intentionally left as static values:
- `rgba(30, 197, 146, 10%)` and `rgba(30, 197, 146, 12%)` — demo data colour for "English Literature" (a custom shade not in the subject palette; will resolve automatically at runtime via `SubjectColorContext`)
- `rgba(0, 0, 0, 30%)` — backdrop overlay on the Overlay Area mock; intentionally a one-off

---

## Page Module Sections

### 1. Navigation
**Figma Node:** `3005:17365`
**View file:** `src/components/layout/Sidebar.tsx`

Covers the full navigation system — desktop sidebar, mobile top bar, and footer.

| Sub-section | Figma Node | Source File | Component Name |
|---|---|---|---|
| Sidebar Nav | `3005:17370` | `src/components/layout/sidebar/SidebarNav.tsx` | `SidebarNav` |
| Sidebar (shell) | `2991:8283` | `src/components/layout/Sidebar.tsx` | `Sidebar` |
| Mobile Navigation | `3005:17435` | `src/components/layout/AppHeader.tsx` | `AppHeader` |
| Footer | `3005:17466` | `src/components/layout/Footer.tsx` | `Footer` |

---

### 2. Dashboard Modules
**Figma Node:** `3005:17477`
**View file:** `src/views/parent/ParentDashboardV3.tsx`

The three primary dashboard widgets shown on the parent home screen.

| Sub-section | Figma Node | Source File | Component Name |
|---|---|---|---|
| This Week's Story | `3005:17482` | `src/components/parent/dashboard/DashboardHeroCard.tsx` | `DashboardHeroCard` |
| Health Score | `3005:17546` | `src/components/parent/dashboard/HealthScoreCard.tsx` | `HealthScoreCard` |
| Revision Plan | `3005:17586` | `src/components/parent/dashboard/DashboardRevisionPlan.tsx` | `DashboardRevisionPlan` |

---

### 3. Subjects
**Figma Node:** `3005:17712`
**View file:** `src/views/parent/SubjectProgress.tsx`

Subject card grid and statistics summary panels.

| Sub-section | Figma Node | Source File | Component Name |
|---|---|---|---|
| Subject Card | `3005:17717` | `src/components/subjects/SubjectCard.tsx` | `SubjectCard` |
| Stats Grid | `3005:17778` | `src/components/subjects/StatsGrid.tsx` | `StatsGrid` |

---

### 4. Timetable
**Figma Node:** `3005:17802`
**View file:** `src/views/parent/Timetable.tsx`

All four timetable view modes plus the reusable session card.

| Sub-section | Figma Node | Source File | Component Name |
|---|---|---|---|
| Week View | `3005:17807` | `src/components/timetable/WeekView.tsx` | `WeekView` |
| Session Card | `3005:17892` | `src/components/timetable/SessionCard.tsx` | `SessionCard` |
| Today View | `3005:17946` | `src/components/timetable/TodayView.tsx` | `TodayView` |
| Month View | `3005:18015` | `src/components/timetable/MonthView.tsx` | `MonthView` |

> **Timetable colour flow:** Database → `useTimetableData` remaps with `SUBJECT_PALETTE` → `session.color` → components. Session cards use `bg-background border-border` for the shell; subject colour appears only as an accent badge or border highlight.

---

### 5. Rewards
**Figma Node:** `3005:18133`
**View file:** `src/views/parent/RewardManagement.tsx`

Reward management cards showing full and compact display modes.

| Sub-section | Figma Node | Source File | Component Name |
|---|---|---|---|
| Reward Toggle Card | `3005:18138` | `src/components/parent/rewards/AgreedRewardsCard.tsx` | `AgreedRewardsCard` |
| Compact Mode | `3005:18192` | `src/components/parent/rewards/RewardHeroHeader.tsx` | `RewardHeroHeader` |

---

### 6. Insights
**Figma Node:** `3005:18224`
**View file:** `src/views/parent/InsightsDashboard.tsx`

Eight analytics widgets making up the full Insights dashboard.

| Sub-section | Figma Node | Source File | Component Name |
|---|---|---|---|
| Hero Story | `3005:18229` | `src/components/parent/insights/HeroStoryWidget.tsx` | `HeroStoryWidget` |
| Progress Plan | `3005:18266` | `src/components/parent/insights/ProgressPlanWidget.tsx` | `ProgressPlanWidget` |
| Confidence Trend | `3005:18286` | `src/components/parent/insights/ConfidenceTrendWidget.tsx` | `ConfidenceTrendWidget` |
| Subject Balance | `3005:18307` | `src/components/parent/insights/SubjectBalanceWidget.tsx` | `SubjectBalanceWidget` |
| Momentum | `3005:18335` | `src/components/parent/insights/MomentumWidget.tsx` | `MomentumWidget` |
| Focus Mode | `3005:18359` | `src/components/parent/insights/FocusModeWidget.tsx` | `FocusModeWidget` |
| Tutor Advice | `3005:18385` | `src/components/parent/insights/TutorAdviceWidget.tsx` | `TutorAdviceWidget` |
| Confidence Heatmap | `3005:18402` | `src/components/parent/insights/ConfidenceHeatmapWidget.tsx` | `ConfidenceHeatmapWidget` |

---

### 7. Pricing
**Figma Node:** `3005:18506`
**View file:** `src/views/parent/Pricing.tsx`

Pricing page with plan comparison cards.

| Sub-section | Figma Node | Source File | Component Name |
|---|---|---|---|
| Pricing Cards | `3005:18510` | `src/views/parent/Pricing.tsx` | `PricingCards` |

---

## Code Connect Mappings

**Total mappings defined:** 31 (7 section-level + 24 sub-section-level)

All mappings use `label: "React"` and target file key `TSeO2EF4ijKMzrp4LVaCr7`.

> **Note:** Figma Code Connect requires an Organization or Enterprise plan with a Developer seat. Use the `send_code_connect_mappings` MCP tool or `figma connect publish` CLI to register these once the plan is in place.

### Full Mapping Table

| Component Name | Figma Node | Source Path |
|---|---|---|
| `Navigation` | `3005:17365` | `src/components/layout/Sidebar.tsx` |
| `SidebarNav` | `3005:17370` | `src/components/layout/sidebar/SidebarNav.tsx` |
| `Sidebar` | `2991:8283` | `src/components/layout/Sidebar.tsx` |
| `AppHeader` | `3005:17435` | `src/components/layout/AppHeader.tsx` |
| `Footer` | `3005:17466` | `src/components/layout/Footer.tsx` |
| `ParentDashboard` | `3005:17477` | `src/views/parent/ParentDashboardV3.tsx` |
| `DashboardHeroCard` | `3005:17482` | `src/components/parent/dashboard/DashboardHeroCard.tsx` |
| `HealthScoreCard` | `3005:17546` | `src/components/parent/dashboard/HealthScoreCard.tsx` |
| `DashboardRevisionPlan` | `3005:17586` | `src/components/parent/dashboard/DashboardRevisionPlan.tsx` |
| `SubjectProgress` | `3005:17712` | `src/views/parent/SubjectProgress.tsx` |
| `SubjectCard` | `3005:17717` | `src/components/subjects/SubjectCard.tsx` |
| `StatsGrid` | `3005:17778` | `src/components/subjects/StatsGrid.tsx` |
| `Timetable` | `3005:17802` | `src/views/parent/Timetable.tsx` |
| `WeekView` | `3005:17807` | `src/components/timetable/WeekView.tsx` |
| `SessionCard` | `3005:17892` | `src/components/timetable/SessionCard.tsx` |
| `TodayView` | `3005:17946` | `src/components/timetable/TodayView.tsx` |
| `MonthView` | `3005:18015` | `src/components/timetable/MonthView.tsx` |
| `RewardManagement` | `3005:18133` | `src/views/parent/RewardManagement.tsx` |
| `AgreedRewardsCard` | `3005:18138` | `src/components/parent/rewards/AgreedRewardsCard.tsx` |
| `RewardHeroHeader` | `3005:18192` | `src/components/parent/rewards/RewardHeroHeader.tsx` |
| `InsightsDashboard` | `3005:18224` | `src/views/parent/InsightsDashboard.tsx` |
| `HeroStoryWidget` | `3005:18229` | `src/components/parent/insights/HeroStoryWidget.tsx` |
| `ProgressPlanWidget` | `3005:18266` | `src/components/parent/insights/ProgressPlanWidget.tsx` |
| `ConfidenceTrendWidget` | `3005:18286` | `src/components/parent/insights/ConfidenceTrendWidget.tsx` |
| `SubjectBalanceWidget` | `3005:18307` | `src/components/parent/insights/SubjectBalanceWidget.tsx` |
| `MomentumWidget` | `3005:18335` | `src/components/parent/insights/MomentumWidget.tsx` |
| `FocusModeWidget` | `3005:18359` | `src/components/parent/insights/FocusModeWidget.tsx` |
| `TutorAdviceWidget` | `3005:18385` | `src/components/parent/insights/TutorAdviceWidget.tsx` |
| `ConfidenceHeatmapWidget` | `3005:18402` | `src/components/parent/insights/ConfidenceHeatmapWidget.tsx` |
| `Pricing` | `3005:18506` | `src/views/parent/Pricing.tsx` |
| `PricingCards` | `3005:18510` | `src/views/parent/Pricing.tsx` |

### Activating Code Connect

When the Figma plan supports it, use the `send_code_connect_mappings` MCP tool:

```
Tool: send_code_connect_mappings
nodeId: "3005:17365"
fileKey: "TSeO2EF4ijKMzrp4LVaCr7"
mappings: [ ...all rows from the mapping table above with label: "React" ]
```

Or use the [Figma Code Connect CLI](https://github.com/figma/code-connect):
```bash
figma connect publish --token <FIGMA_TOKEN>
```

---

## Design Decisions

### Icons
All icons in the Page Modules page use **Lucide React** instances, not emoji or custom SVGs. Icon strokes are bound to the appropriate semantic colour token (typically `color/foreground`, `color/primary`, or `color/muted-foreground`). The icon component used in Figma matches the `lucide-react` package version used in code.

### Buttons
All button-like UI elements use live **DoorSlam Button component instances** from the Components page. Variant and label are set as component properties — no standalone styled frames.

### Font Sizes
All text nodes are bound to DoorSlam text styles where a matching token exists. The `TODAY` label (display heading) is bound to `DoorSlam/2xs/Medium` (10px). Large display sizes (28px, 22px) are intentional one-off values with no matching token and are left unstyled.

### Badge Status Variants
Status badges throughout the modules follow the convention:
- `badgeStyle="soft"` always
- In-progress → `variant="warning"`
- Completed → `variant="success"`
- Planned → `variant="default"`

---

## Related Files

| File | Purpose |
|---|---|
| `docs/FIGMA_HANDOFF.md` | Component library handoff (text styles, component sets, variable bindings) |
| `src/styles/themes.css` | CSS custom properties — source of truth for all design tokens |
| `src/constants/colors.ts` | `COLORS`, `SUBJECT_PALETTE`, `SUBJECT_COLOR_MAP` |
| `src/utils/colorUtils.ts` | `hexToRgba`, `buildSubjectColorMap` |
| `src/contexts/SubjectColorContext.tsx` | Subject colour provider — `getColor(subjectId)` |
| `tailwind.config.js` | Font size tokens, `max-w-content`, spacing extensions |
