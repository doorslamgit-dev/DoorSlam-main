# Suite 02 — Chat & Streaming

> **Scope**: Sending messages, SSE streaming responses, basic chat interaction
> **Module**: 1 — App Shell
> **Depends on**: Suite 01 (logged in as parent, panel open)

## State

- **Requires**: `$LOGGED_IN_ROLE=parent`, `$PANEL_OPEN=true`
- **Produces**: `$HAS_CONVERSATION=true`

---

## Tests

### TEST-02.1: Send Message

**Steps**:
1. `browser_snapshot` → verify chat input is visible and enabled
2. Type "What is photosynthesis?" in the chat input
3. Press Enter (or click the send button)
4. `browser_snapshot` immediately → verify user message bubble appeared

**Pass criteria**:
- [ ] User message appears as a bubble (right-aligned or visually distinct)
- [ ] Message text matches what was typed
- [ ] Input field is disabled or shows loading state

---

### TEST-02.2: Streaming Response

**Depends on**: TEST-02.1 (message sent)

**Steps**:
1. Wait 10–15s for streaming to complete (watch for assistant bubble to stop growing)
2. `browser_snapshot` → capture the completed response

**Pass criteria**:
- [ ] Assistant response appears as a bubble (left-aligned or visually distinct from user)
- [ ] Response contains actual content about photosynthesis (not empty, not an error)
- [ ] Input field is re-enabled after streaming completes
- [ ] No error banner or alert visible

---

### TEST-02.3: Follow-up Message

**Depends on**: TEST-02.2 (first response received)

**Steps**:
1. Type "Can you explain that more simply?" in the chat input
2. Press Enter
3. Wait 10–15s for streaming
4. `browser_snapshot` → verify follow-up response

**Pass criteria**:
- [ ] Second user message appears below the first exchange
- [ ] Second assistant response appears
- [ ] Response is contextually relevant (references photosynthesis, simpler language)
- [ ] Both message pairs visible in the chat (scroll if needed)

---

### TEST-02.4: Conversation Persistence (Close/Reopen)

**Depends on**: TEST-02.3 (multiple messages in conversation)

**Steps**:
1. Note the current messages visible in the panel
2. Click close button (X) on AI Tutor panel
3. Wait 1s
4. Click AI Tutor button to reopen
5. Wait 3s for messages to load
6. `browser_snapshot` → verify previous messages are still there

**Pass criteria**:
- [ ] Panel closes cleanly
- [ ] Panel reopens
- [ ] Previous messages (both user and assistant) are displayed
- [ ] Messages appear in the correct order

---

## Teardown

None — leave the panel open with the existing conversation. Suite 03 needs this state.

**State after**: `$LOGGED_IN_ROLE=parent`, `$PANEL_OPEN=true`, `$HAS_CONVERSATION=true`
