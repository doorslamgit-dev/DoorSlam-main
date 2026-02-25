# shadcn/ui Design System Migration Plan

## Status: Assessment Complete — Awaiting Designer Specs

## Context

The designer has chosen shadcn/ui as the foundation of the Doorslam design system. This plan captures the current state of adoption, remaining work, and the strategy for completing the migration.

---

## Current State (~70% Complete)

### Infrastructure (Done)

| Piece | Status |
|-------|--------|
| `components.json` (shadcn CLI config) | Installed |
| `src/lib/utils.ts` with `cn()` | Installed |
| 11 `@radix-ui/*` packages | Installed |
| `class-variance-authority` | Installed |
| `clsx` + `tailwind-merge` | Installed |
| `tailwindcss-animate` | Installed |
| HSL CSS variable theming (`themes.css`) | Configured |
| Tailwind config extended for shadcn tokens | Done |
| Dark mode (`darkMode: 'class'`) | Working |

### shadcn Primitives Installed (15)

dialog, input, textarea, label, progress, separator, skeleton, tooltip, dropdown-menu, tabs, select, sheet, switch, accordion, table

### DoorSlam Custom Wrappers (Keep & Align)

These follow shadcn's recommended extension pattern (CVA + forwardRef + cn). They should NOT be replaced — just aligned to the designer's spec:

| Component | File | Usage | Action Needed |
|-----------|------|-------|---------------|
| Button | `src/components/ui/Button.tsx` | 15+ files | Align variants to design spec |
| Card | `src/components/ui/Card.tsx` | 15+ files | Align variants to design spec |
| Badge | `src/components/ui/Badge.tsx` | 10+ files | Align variants to design spec |
| Alert | `src/components/ui/Alert.tsx` | 5+ files | Align variants to design spec |
| FormField | `src/components/ui/FormField.tsx` | 10+ files | Align to design spec |
| Modal | `src/components/ui/Modal.tsx` | 5+ files | Align to design spec |
| Toast | `src/components/ui/Toast.tsx` | 2 files | Consider replacing with sonner if designer specifies |

### App-Specific Components (No shadcn Equivalent)

These stay as-is — shadcn doesn't provide equivalents:

- StatCard, ProgressBar, CircularProgress, EmptyState, LoadingSpinner, AvatarCircle, IconCircle, AppIcon, ThemeToggle

---

## Remaining Work

### Phase 1: Cleanup (Small — Can Do Now)

- [x] Delete duplicate `Select.tsx` casing conflict (done: commit `b5c0246`)
- [x] Delete merge artifact duplicates: `switch 2.tsx`, `tooltip 2.tsx`, `textarea 2.tsx`
- [ ] Delete duplicate Python files in `ai-tutor-api/` (`* 2.py` files)
- [ ] Delete `src/services/aiAssistantService 2.ts`

### Phase 2: Legacy Token Audit (Medium)

- [ ] Audit `src/styles/themes.css` — identify which legacy tokens (Phase 4/5 comments) are still referenced
- [ ] Search codebase for direct usage of legacy CSS variables (`--color-primary-*`, `--color-neutral-*`, `--spacing-*`, etc.)
- [ ] Create migration PR removing unused legacy tokens
- [ ] Update remaining usages to shadcn token equivalents

### Phase 3: Design System Alignment (Medium — Needs Designer Input)

Decisions needed from the designer before proceeding:

- [ ] **Button variants**: Which set? Current: `primary`, `secondary`, `ghost`, `danger`, `default`, `destructive`
- [ ] **Card variants**: Which set? Current: `default`, `elevated`, `outlined`, `flat`
- [ ] **Badge variants**: Which compound variants are canonical? Current: 18 combos (variant x style)
- [ ] **Color palette**: Are the current HSL tokens correct, or does the designer have a different palette?
- [ ] **Typography scale**: Keep current CSS custom properties, or adopt Tailwind typography plugin?
- [ ] **Additional components**: Which shadcn components should be added? (e.g., Popover, Command, Calendar, Combobox, etc.)

### Phase 4: Add New Components (Ongoing — Low Effort Each)

As the designer specs new components:

```bash
npx shadcn@latest add <component-name>
```

Components are installed to `src/components/ui/` and follow all existing patterns automatically.

### Phase 5: Documentation

- [ ] Update `src/views/parent/DesignGuidelines.tsx` to reflect final design system
- [ ] Document canonical component variants and usage patterns

---

## Key Files

| File | Role |
|------|------|
| `components.json` | shadcn CLI configuration |
| `src/lib/utils.ts` | `cn()` utility (clsx + tailwind-merge) |
| `src/components/ui/index.ts` | Central component barrel exports |
| `src/styles/themes.css` | CSS design tokens (shadcn + legacy) |
| `src/styles/globals.css` | Tailwind base layers + shadcn |
| `tailwind.config.js` | Extended theme (colors, spacing, animations) |

## Anti-Patterns to Avoid

- **Don't replace DoorSlam wrappers with raw shadcn** — the wrappers add app-specific value (loading states, icon support, status mapping) and are used in 30+ files
- **Don't remove all legacy tokens at once** — audit first, migrate incrementally
- **Don't add shadcn components speculatively** — only add what the designer has specced
