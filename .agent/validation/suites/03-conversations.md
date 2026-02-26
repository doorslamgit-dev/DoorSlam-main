# Suite 03 — Conversation Management

> **Scope**: Creating new conversations, browsing history, loading past conversations, deleting conversations
> **Module**: 1 — App Shell
> **Depends on**: Suite 02 (at least one conversation with messages exists)

## State

- **Requires**: `$LOGGED_IN_ROLE=parent`, `$PANEL_OPEN=true`, `$HAS_CONVERSATION=true`
- **Produces**: `$CONVERSATION_COUNT>=2`

---

## Tests

### TEST-03.1: Create New Conversation

**Steps**:
1. `browser_snapshot` → verify existing conversation is showing (messages from Suite 02)
2. Click "New conversation" button (+ icon in panel header)
3. Wait 1s
4. `browser_snapshot` → verify empty state

**Pass criteria**:
- [ ] Previous messages are cleared
- [ ] Welcome message shown in empty state
- [ ] Chat input is enabled and ready

---

### TEST-03.2: Second Conversation Works Independently

**Depends on**: TEST-03.1 (new conversation started)

**Steps**:
1. Type "Explain the water cycle" and press Enter
2. Wait 10–15s for streaming response
3. `browser_snapshot` → verify new exchange

**Pass criteria**:
- [ ] User message about water cycle appears
- [ ] Assistant response about water cycle appears (not photosynthesis)
- [ ] This is a fresh conversation (no messages from Suite 02 visible)

---

### TEST-03.3: Open Conversation History

**Depends on**: TEST-03.2 (at least two conversations exist)

**Steps**:
1. Click the history button (clock icon in panel header)
2. Wait 2s for history to load
3. `browser_snapshot` → verify history drawer

**Pass criteria**:
- [ ] History drawer/panel opens below the header
- [ ] At least two conversations listed
- [ ] Conversations show auto-generated titles
- [ ] Each conversation shows a timestamp or relative date

---

### TEST-03.4: Load Past Conversation

**Depends on**: TEST-03.3 (history visible)

**Steps**:
1. Identify the older conversation in the history list (not the current "water cycle" one)
2. Click on it
3. Wait 3s for messages to load
4. `browser_snapshot` → verify loaded conversation

**Pass criteria**:
- [ ] History drawer closes (or conversation loads inline)
- [ ] Messages from the selected conversation are displayed (photosynthesis messages from Suite 02)
- [ ] Conversation title visible in header area

---

### TEST-03.5: Delete Conversation (Two-Click Confirm)

**Steps**:
1. Click the history button to open the history drawer
2. `browser_snapshot` → note the number of conversations
3. Click the trash/delete icon on one conversation → first click
4. `browser_snapshot` → verify confirm state (icon changes to red/confirm)
5. Click the trash/delete icon again → confirm delete
6. Wait 1s
7. `browser_snapshot` → verify conversation removed

**Pass criteria**:
- [ ] First click shows confirm state (visual change on the delete button)
- [ ] Second click deletes the conversation
- [ ] Conversation is removed from the history list
- [ ] Remaining conversations still visible

---

## Teardown

Close history drawer if open. Ensure panel is still open with a valid conversation.

**State after**: `$LOGGED_IN_ROLE=parent`, `$PANEL_OPEN=true`, `$CONVERSATION_COUNT>=1`
