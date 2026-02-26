# Suite 04 — Error Handling

> **Scope**: Error states, recovery after backend failure, edge cases
> **Module**: 1 — App Shell
> **Depends on**: Suite 01 (logged in, panel open)

## State

- **Requires**: `$LOGGED_IN_ROLE=parent`, `$PANEL_OPEN=true`
- **Produces**: Nothing — this suite is stateless

---

## Tests

### TEST-04.1: Empty Message Rejected

**Steps**:
1. `browser_snapshot` → verify chat input is visible
2. Click the send button without typing anything (or press Enter on empty input)
3. `browser_snapshot` → verify nothing was sent

**Pass criteria**:
- [ ] No user message bubble appears
- [ ] No network request fired (check `browser_console_messages` for errors)
- [ ] Input remains in idle state

---

### TEST-04.2: Backend Down — Error State

> **Note**: This test requires stopping the FastAPI server. It is **semi-manual** — the agent should instruct the operator to stop the server, or use Bash to kill the process.

**Steps**:
1. Verify the panel is open and working (send a quick test message if needed)
2. **Stop the FastAPI server** (the executing agent or operator should run: `pkill -f "uvicorn src.main:app"` or Ctrl+C in the API terminal)
3. Wait 2s for the server to stop
4. Type "This should fail" in the chat input and press Enter
5. Wait 5s
6. `browser_snapshot` → verify error state

**Pass criteria**:
- [ ] Error banner or error message displayed in the panel
- [ ] No assistant response bubble (or error bubble)
- [ ] UI does not crash — panel is still rendered

---

### TEST-04.3: Backend Recovery

**Depends on**: TEST-04.2 (backend is down)

**Steps**:
1. **Restart the FastAPI server**: `cd ai-tutor-api && source venv/bin/activate && uvicorn src.main:app --reload --port 8000 &`
2. Wait 3s for the server to start
3. Type "Are you working again?" in the chat input and press Enter
4. Wait 10–15s for streaming response
5. `browser_snapshot` → verify recovery

**Pass criteria**:
- [ ] Assistant response appears normally
- [ ] No lingering error state
- [ ] Chat is fully functional again

---

## Teardown

Ensure FastAPI server is running. If it was stopped during TEST-04.2, confirm it was restarted in TEST-04.3.

**State after**: `$LOGGED_IN_ROLE=parent`, `$PANEL_OPEN=true` (servers healthy)
