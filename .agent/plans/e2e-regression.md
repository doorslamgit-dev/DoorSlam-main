# AI Tutor — E2E Regression Checklist (Playwright MCP)

> **Scope**: AI Tutor feature ONLY. These tests cover the chat panel, conversation
> management, and streaming — NOT the wider Doorslam application (dashboard, timetable,
> sessions, rewards, etc.). Login is only used as a prerequisite to reach the AI Tutor.
>
> Agent-driven using Playwright MCP. Run against live dev environment.
> Updated as each module adds user-facing features.

## Prerequisites

Before running, verify both servers are up:
1. **Vite dev server**: `http://localhost:5173` (run `npm run dev`)
2. **FastAPI backend**: `http://localhost:8000` (run `cd ai-tutor-api && source venv/bin/activate && uvicorn src.main:app --reload --port 8000`)

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Parent | jsmith@example.com | N0rt0nBavant! |
| Child | hannah@example.com | N0rt0nBavant! |

---

## Module 1: App Shell — Regression Tests

### E2E-1: Parent Login → AI Tutor Opens

**Steps**:
1. `browser_navigate` → `http://localhost:5173/login`
2. `browser_snapshot` → verify login form visible
3. `browser_fill_form` → email: `jsmith@example.com`, password: `N0rt0nBavant!`
4. Click "Sign in" button
5. Wait for redirect to dashboard (parent route)
6. `browser_snapshot` → verify sidebar visible
7. Click AI Tutor button in sidebar (sparkles icon)
8. `browser_snapshot` → verify AI Tutor panel is open

**Pass criteria**:
- [ ] Login succeeds (no error alert)
- [ ] Redirected to parent dashboard
- [ ] AI Tutor panel opens with "AI Tutor" header
- [ ] Welcome message mentions "child's GCSE subjects"

---

### E2E-2: Send Message → Streaming Response

**Depends on**: E2E-1 (panel open, logged in as parent)

**Steps**:
1. Type "What is photosynthesis?" in chat input
2. Press Enter (or click send)
3. `browser_snapshot` → verify user bubble appeared
4. Wait 5-10 seconds for streaming to complete
5. `browser_snapshot` → verify assistant response present

**Pass criteria**:
- [ ] User message appears as blue bubble (right side)
- [ ] Assistant response appears as gray bubble (left side)
- [ ] Response contains actual content (not empty or error)
- [ ] Panel state returns to idle (input re-enabled)

---

### E2E-3: Conversation Persistence

**Depends on**: E2E-2 (at least one message exchanged)

**Steps**:
1. Note the conversation content
2. Click close button (X) on AI Tutor panel
3. `browser_snapshot` → verify panel is closed
4. Click AI Tutor button again to reopen
5. `browser_snapshot` → verify previous messages visible

**Pass criteria**:
- [ ] Panel closes cleanly
- [ ] Panel reopens
- [ ] Previous messages are still displayed

---

### E2E-4: New Conversation

**Depends on**: E2E-3 (has existing conversation)

**Steps**:
1. Click "New conversation" button (+ icon in header)
2. `browser_snapshot` → verify empty state with welcome message
3. Type "Explain the water cycle" and press Enter
4. Wait for response
5. `browser_snapshot` → verify new conversation with new message

**Pass criteria**:
- [ ] Messages cleared after clicking "New"
- [ ] Welcome message shown in empty state
- [ ] New message exchange works independently

---

### E2E-5: Conversation History

**Depends on**: E2E-4 (at least two conversations exist)

**Steps**:
1. Click history button (clock icon in header)
2. `browser_snapshot` → verify history drawer is open
3. Verify at least one conversation listed with a title

**Pass criteria**:
- [ ] History drawer opens below header
- [ ] At least one past conversation visible
- [ ] Conversations show titles (auto-generated)

---

### E2E-6: Load Past Conversation

**Depends on**: E2E-5 (history visible)

**Steps**:
1. Click on a conversation in the history list
2. Wait for messages to load
3. `browser_snapshot` → verify messages from that conversation

**Pass criteria**:
- [ ] History drawer closes
- [ ] Messages from the selected conversation are displayed
- [ ] Conversation title shown below header

---

### E2E-7: Delete Conversation

**Depends on**: E2E-5 (history visible with conversations)

**Steps**:
1. Open history drawer
2. `browser_snapshot` → note conversation count
3. Click trash icon on a conversation → first click
4. `browser_snapshot` → verify confirm state (red trash icon)
5. Click trash icon again → confirm delete
6. `browser_snapshot` → verify conversation removed from list

**Pass criteria**:
- [ ] First click shows confirm state
- [ ] Second click deletes the conversation
- [ ] Conversation removed from the list

---

### E2E-8: Child Login → Child Welcome

**Steps**:
1. If logged in, sign out (navigate to / or clear session)
2. `browser_navigate` → `http://localhost:5173/login`
3. `browser_fill_form` → email: `hannah@example.com`, password: `N0rt0nBavant!`
4. Click "Sign in"
5. Wait for redirect
6. Open AI Tutor panel
7. `browser_snapshot` → verify child-specific welcome

**Pass criteria**:
- [ ] Login succeeds
- [ ] Redirected to child route
- [ ] AI Tutor welcome message mentions "any topic you're revising"
- [ ] Chat input placeholder says "Ask as a student..."

---

### E2E-9: Error Recovery (Manual)

> This test requires stopping/starting the FastAPI server manually.

**Steps**:
1. Ensure AI Tutor panel is open and working
2. Stop FastAPI server (Ctrl+C in terminal)
3. Send a message → verify error state
4. Restart FastAPI server
5. Send another message → verify recovery

**Pass criteria**:
- [ ] Error banner displayed when API is down
- [ ] Chat works again after API restarts

---

## Summary

| # | Test | Module | Auto/Manual |
|---|------|--------|-------------|
| E2E-1 | Parent login → AI Tutor opens | 1 | Auto (Playwright) |
| E2E-2 | Send message → streaming response | 1 | Auto (Playwright) |
| E2E-3 | Conversation persistence | 1 | Auto (Playwright) |
| E2E-4 | New conversation | 1 | Auto (Playwright) |
| E2E-5 | Conversation history | 1 | Auto (Playwright) |
| E2E-6 | Load past conversation | 1 | Auto (Playwright) |
| E2E-7 | Delete conversation | 1 | Auto (Playwright) |
| E2E-8 | Child login → child welcome | 1 | Auto (Playwright) |
| E2E-9 | Error recovery | 1 | Manual |

---

## Extending for Future Modules

When a new module adds user-facing features, add tests here:

- **Module 2 (Retrieval)**: Add E2E-10 — source citations appear below assistant messages
- **Module 5 (Multi-Format)**: Verify different document types in citations
- **Module 6 (Hybrid Search)**: Verify improved search relevance
