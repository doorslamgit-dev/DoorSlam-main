# AI Tutor — Validation Orchestrator

> Runs all validation suites in sequence and reports results.
> Read each suite file in order, execute the tests, and track pass/fail.

## Execution Order

Run these suites in order. Each suite's **Depends on** field declares prerequisites.

| Order | Suite file | Description | Depends on |
|-------|-----------|-------------|------------|
| 1 | `suites/01-auth.md` | Login flows (parent + child) | None |
| 2 | `suites/02-chat.md` | Send message, streaming | 01-auth |
| 3 | `suites/03-conversations.md` | New, persist, history, load, delete | 02-chat |
| 4 | `suites/04-error-handling.md` | Error states and recovery | 01-auth |

## Instructions for the Executing Agent

1. **Verify prerequisites**: Both dev servers running (Vite on 5173, FastAPI on 8000).

2. **For each suite in order**:
   a. Read the suite file from `.agent/validation/suites/`
   b. Execute every test in the suite using Playwright MCP tools
   c. Record each test as PASS or FAIL
   d. If a test fails, note the failure reason but **continue** to the next test
   e. Track any state variables the suite produces

3. **State handoff**: Some suites produce state that later suites need (e.g., 01-auth logs in and opens the panel, 02-chat needs that). Don't close the browser between suites unless the suite explicitly requires it.

4. **After all suites complete**, output a summary table:

```
## Validation Results

| Suite | Tests | Passed | Failed | Status |
|-------|-------|--------|--------|--------|
| 01-auth | 4 | 4 | 0 | PASS |
| 02-chat | 4 | 3 | 1 | FAIL |
| ... | ... | ... | ... | ... |

**Overall**: X of Y suites passed

### Failures
- [02-chat] TEST-02.3: Conversation persistence — panel reopened but messages were empty
```

5. **Stop-on-critical**: If 01-auth fails entirely (can't log in), skip all dependent suites and report them as SKIPPED.

## Quick Reference — Suite Dependencies

```
01-auth (independent)
   ├── 02-chat (needs logged-in session + panel open)
   │   └── 03-conversations (needs at least one message exchange)
   └── 04-error-handling (needs logged-in session)
```
