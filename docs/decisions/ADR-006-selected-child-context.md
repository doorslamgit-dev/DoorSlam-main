# ADR-006: Global SelectedChildContext for Cross-Component Child Selection

## Status
Accepted

## Date
2026-02-20

## Context
The child selector was embedded inside the timetable page header, meaning each parent page that needed child selection had to manage its own child list fetching and selection state independently. When the layout was restructured to move the child selector into the sidebar navigation (visible across all pages), child selection state needed to be lifted to a shared location accessible by both the sidebar and all parent page views.

The existing `AuthContext` provides `activeChildId` (for child-role users logging in), but has no concept of "which child is the parent currently viewing" — that was handled locally per page.

## Decision
Created a new `SelectedChildContext` (`src/contexts/SelectedChildContext.tsx`) that:

- Fetches the parent's children list once on mount via `fetchChildrenForParent(user.id)`
- Auto-selects the first child when the list loads
- Stores `selectedChildId`, `selectedChildName`, and the full `children` array
- Exposes a `setSelectedChildId` setter for the sidebar dropdown
- Wraps `SidebarProvider` in the provider hierarchy (`src/providers.tsx`)
- Is consumed by the sidebar (`SidebarNav.tsx`) for the dropdown and by page views (`Timetable.tsx`) for data fetching

The sidebar renders a `<select>` dropdown (parent-only, expanded sidebar only) that sets the selected child globally. All parent pages read from this context instead of fetching children independently.

## Alternatives Considered

### Extend AuthContext with parent's selected child
Rejected — AuthContext handles authentication and role detection. Adding UI-level selection state would conflate authentication concerns with navigation preferences and increase re-render scope for all auth consumers.

### URL parameter only (`?child=<id>`)
Rejected as the sole mechanism — URL params work for deep links but don't persist across page navigations unless every link includes the param. A context provides the "default" selection, and pages can optionally sync with URL params if needed.

### Zustand or other state management library
Rejected — the project uses React Context exclusively for state management (Auth, Theme, Sidebar). Adding a new library for one piece of state would be inconsistent with the established pattern.

## Consequences

### Positive
- Child selection is consistent across all parent pages without prop drilling
- Sidebar dropdown gives parents a persistent, always-visible child switcher
- Pages no longer need to independently fetch children lists (reduces duplicate API calls)
- Pattern is extensible — future parent pages automatically get child selection by consuming the context

### Negative
- One more context provider in the tree (minor — the app already has Auth, Theme, Sidebar, Subscription)
- Child list is fetched on app mount even if the parent navigates to a page that doesn't need it (minimal cost — single lightweight query)

### Follow-up work
- Sync `selectedChildId` with URL `?child=<id>` parameter for deep-linkable child views
- Use `SelectedChildContext` in other parent pages (dashboard, insights, settings) to replace their local child selection logic
