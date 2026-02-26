# Suite 01 — Authentication & Panel Access

> **Scope**: Login flows for parent and child roles, AI Tutor panel open/close
> **Module**: 1 — App Shell
> **Depends on**: None (first suite in the chain)

## State

- **Requires**: Nothing — starts fresh
- **Produces**: `$LOGGED_IN_ROLE=parent`, `$PANEL_OPEN=true`

---

## Tests

### TEST-01.1: Parent Login

**Steps**:
1. `browser_navigate` → `http://localhost:5173/login`
2. `browser_snapshot` → verify login form is visible
3. `browser_fill_form` → email: `jsmith@example.com`, password: `N0rt0nBavant!`
4. Click "Sign in" button
5. Wait up to 5s for redirect
6. `browser_snapshot` → verify parent dashboard loaded

**Pass criteria**:
- [ ] Login form rendered with email and password fields
- [ ] No error alert after submission
- [ ] Redirected to parent dashboard (URL contains `/parent` or shows dashboard content)

---

### TEST-01.2: Open AI Tutor Panel (Parent)

**Depends on**: TEST-01.1 (logged in as parent)

**Steps**:
1. `browser_snapshot` → locate AI Tutor button in sidebar (sparkles icon or "AI Tutor" text)
2. Click the AI Tutor button
3. Wait 1s for panel animation
4. `browser_snapshot` → verify panel is open

**Pass criteria**:
- [ ] AI Tutor button visible in sidebar
- [ ] Panel opens with "AI Tutor" header
- [ ] Welcome message visible (mentions "child's GCSE subjects" for parent role)
- [ ] Chat input field visible and enabled

---

### TEST-01.3: Close and Reopen Panel

**Depends on**: TEST-01.2 (panel open)

**Steps**:
1. Click close button (X) on AI Tutor panel
2. Wait 1s
3. `browser_snapshot` → verify panel is closed
4. Click AI Tutor button again
5. Wait 1s
6. `browser_snapshot` → verify panel is open again

**Pass criteria**:
- [ ] Panel closes cleanly (no visible panel content)
- [ ] Panel reopens successfully
- [ ] Welcome message still shows on reopen

---

### TEST-01.4: Child Login & Role-Specific Welcome

**Steps**:
1. Navigate to `http://localhost:5173/login` (this will log out or redirect)
2. If still logged in, find and click sign out / navigate directly to login
3. `browser_fill_form` → email: `hannah@example.com`, password: `N0rt0nBavant!`
4. Click "Sign in"
5. Wait up to 5s for redirect
6. `browser_snapshot` → verify child dashboard loaded
7. Open AI Tutor panel (click AI Tutor button)
8. `browser_snapshot` → verify child-specific welcome

**Pass criteria**:
- [ ] Login succeeds for child account
- [ ] Redirected to child route
- [ ] AI Tutor welcome message mentions "any topic you're revising" (child variant)
- [ ] Chat input placeholder is child-appropriate

---

## Teardown

After completing this suite, **log back in as parent** so subsequent suites start with the parent session:
1. Navigate to `http://localhost:5173/login`
2. Log in as `jsmith@example.com` / `N0rt0nBavant!`
3. Open AI Tutor panel

**State after teardown**: `$LOGGED_IN_ROLE=parent`, `$PANEL_OPEN=true`
