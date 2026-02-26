---
description: Validate the current AI Tutor module build
argument-hint: [module-number]
---

# AI Tutor — Module Validation

> **Scope**: AI Tutor feature only (`ai-tutor-api/`, `src/components/layout/ai-tutor/`, `src/services/aiAssistantService.ts`).
> Playwright MCP is used ONLY for AI Tutor E2E flows — not the wider Doorslam application.

Run the validation suite for the current module. This is the **Validate** phase of Plan → Build → **Validate**.

**Argument**: `$ARGUMENTS` — module number. If empty, auto-detect from `PROGRESS.md`.

## Process

### 1. Read the plan

- Read `.agent/plans/{N}.{name}.md`
- Extract all validation checkboxes from each task
- Extract the Integration Test section

### 2. Run AI Tutor backend tests

```bash
cd ai-tutor-api && ./venv/bin/python -m pytest tests/ -v
```

This runs all backend regression tests (auth, chat stream, conversations, models).

### 3. Run full frontend CI checks

These cover the whole project — ensuring AI Tutor changes haven't broken anything:

```bash
npm run lint
npm run type-check
npm run test
npm run build
```

Frontend test suite includes AI Tutor regression tests (service layer, ChatInput, MessageBubble, ConversationList, AiTutorSlot).

### 4. Run plan-specific validations

Walk through each task's **Validation** checklist from the plan:
- For automated checks (curl, DB queries, CLI commands) — run them
- For manual/visual checks (UI behaviour) — report what to verify manually

### 5. Run AI Tutor E2E regression (Playwright MCP)

**Only if both dev servers are running** (Vite on 5173, FastAPI on 8000).

Read `.agent/plans/e2e-regression.md` and execute the E2E flows using Playwright MCP tools.
These tests cover ONLY the AI Tutor panel — login is just the means to reach it.

Skip E2E if:
- Dev servers aren't running
- Changes were backend-only with no UI impact
- User explicitly requests to skip

### 6. Check documentation completeness

- [ ] `CHANGELOG.md` has entry for this module
- [ ] `docs/PRODUCT_EVOLUTION.md` has section for this module
- [ ] `PROGRESS.md` module status is up to date
- [ ] ADR created if architectural decisions were made

## Output

```
## Module N Validation Report

### AI Tutor backend tests
| Check | Result |
|-------|--------|
| pytest | ✓ X passed / ✗ Y failed |

### Full project CI gate
| Check | Result |
|-------|--------|
| ESLint | ✓ 0 warnings |
| TypeScript | ✓ No errors |
| Vitest | ✓ X passed |
| Vite build | ✓ Success |

### Plan task validations
- [ ] Task 1: <validation item> — <pass/fail/manual>
- [ ] Task 2: <validation item> — <pass/fail/manual>

### AI Tutor E2E (Playwright MCP)
- [ ] E2E-1: Parent login → AI Tutor opens — <pass/skip>
- [ ] E2E-2: Send message → streaming — <pass/skip>
(etc.)

### Documentation
- [ ] CHANGELOG.md — <present/missing>
- [ ] PRODUCT_EVOLUTION.md — <present/missing>
- [ ] PROGRESS.md — <updated/needs update>

### Verdict: <PASS / FAIL — N issues to fix>
```

If **FAIL**: list exactly what needs fixing. Do not mark the module as Done.
If **PASS**: confirm the module is ready. Update `PROGRESS.md` to **Done** and ask if you should push + create PR.
