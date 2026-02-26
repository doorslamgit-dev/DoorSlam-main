# AI Tutor — Validation Suite

> Agent-driven E2E regression tests using Playwright MCP.
> Each suite file is a self-contained prompt for a Claude agent to execute.

## Directory Structure

```
.agent/validation/
├── README.md           ← You are here
├── run-all.md          ← Orchestrator — runs all suites in sequence
├── fixtures/           ← Test data files
│   ├── test_document.txt
│   ├── test_rag_document.txt
│   ├── test_document.md
│   └── empty.txt
└── suites/             ← Individual test suites
    ├── 01-auth.md
    ├── 02-chat.md
    ├── 03-conversations.md
    └── 04-error-handling.md
```

## Prerequisites

Both servers must be running before executing any suite:

| Server | URL | Start command |
|--------|-----|---------------|
| Vite dev | `http://localhost:5173` | `npm run dev` |
| FastAPI | `http://localhost:8000` | `cd ai-tutor-api && source venv/bin/activate && uvicorn src.main:app --reload --port 8000` |

Or use the single script: `./scripts/dev-start.sh`

## Test Accounts

| Role | Email | Password | Variable |
|------|-------|----------|----------|
| Parent | `jsmith@example.com` | `N0rt0nBavant!` | `$PARENT` |
| Child | `hannah@example.com` | `N0rt0nBavant!` | `$CHILD` |

## How to Run

### Run all suites (via orchestrator)
Read and follow `.agent/validation/run-all.md` — it sequences all suites and tracks results.

### Run a single suite
Read the suite file directly (e.g., `.agent/validation/suites/02-chat.md`) and follow the agent instructions. Check the **Depends on** field — some suites require a prior suite to have run first.

### Run via `/validate` skill
The `/validate` skill invokes the orchestrator automatically.

## Suite Conventions

Every suite file follows this structure:

```markdown
# Suite NN — <Name>
> Scope: what this suite covers
> Module: which AI Tutor module introduced these tests
> Depends on: prior suites required (or "None")

## State
- **Requires**: variables/state from prior suites
- **Produces**: variables/state passed to later suites

## Tests
### TEST-NN.N: <Name>
**Steps**: numbered Playwright MCP actions
**Pass criteria**: checkboxes

## Teardown
Cleanup actions (if any)
```

## Variable Tracking

Suites pass state via named variables. The orchestrator tracks these.

| Variable | Set by | Description |
|----------|--------|-------------|
| `$LOGGED_IN_ROLE` | 01-auth | Currently logged-in role (parent/child) |
| `$PANEL_OPEN` | 01-auth | Whether AI Tutor panel is open |
| `$HAS_CONVERSATION` | 02-chat | Whether at least one message exchange exists |
| `$CONVERSATION_COUNT` | 03-conversations | Number of conversations created |

## Adding Tests for New Modules

When a new AI Tutor module adds user-facing features:

1. **Create a new suite file**: `.agent/validation/suites/NN-<name>.md`
2. **Follow the suite template** above
3. **Number sequentially**: use the next available `NN` prefix
4. **Declare dependencies**: list which prior suites must run first
5. **Update `run-all.md`**: add the new suite to the execution order
6. **Add fixtures if needed**: place test data in `fixtures/`

Never modify existing suite tests unless fixing a genuine bug in the test itself. New features get new suites.

## Timeout Guidance

| Operation | Recommended wait |
|-----------|-----------------|
| Page navigation | 3s |
| Login redirect | 5s |
| SSE streaming response | 10–15s |
| Panel open/close animation | 1s |
| History drawer load | 3s |
