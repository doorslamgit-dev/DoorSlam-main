---
description: Plan the next AI Tutor module
argument-hint: [module-number]
---

# AI Tutor — Module Planning

Create or review the plan for a module. If a plan already exists, review it and confirm readiness. If no plan exists, draft one.

**Module requested**: `$ARGUMENTS` (if empty, auto-detect from `PROGRESS.md` — first Pending module)

## Process

1. **Read CLAUDE.md** — load project standards and AI Tutor architecture

2. **Read PROGRESS.md** — identify the target module and its dependencies

3. **Check prerequisites**
   - Are all prior modules marked **Done**?
   - If not, flag this — modules should be completed in order

4. **Check for existing plan**
   - Look in `.agent/plans/{N}.{name}.md`
   - If it exists, read it and present a summary for review

5. **If no plan exists — draft one**
   - Read the codebase context: what was built in prior modules
   - Read any relevant reference documents in `reference documents/`
   - Read the current backend structure: `ai-tutor-api/src/`
   - Read the current frontend AI Tutor components: `src/components/layout/ai-tutor/`

   Draft the plan following this structure:
   ```
   # Module N: <Title>
   > **Complexity**: <Low | Medium | High>
   > **Branch**: feature/ai-tutor-module{N}-<short-name>

   ## Context
   What was built before, what this module adds

   ## Prerequisites
   - [ ] Checklist of things needed before starting

   ## Tasks
   ### Task 1: <Title>
   **Files**: list of files to create/modify
   **Implementation**: what to build and how
   **Validation**:
   - [ ] Specific test or check to prove it works

   ### Task 2: ...
   (repeat for each task)

   ## Integration Test
   End-to-end validation after all tasks complete

   ## Files Summary
   | File | Action | Purpose |
   |------|--------|---------|
   ```

6. **Save the plan** to `.agent/plans/{N}.{name}.md`

## Output

Present the plan summary and ask: "Shall I proceed to build this module, or do you want to adjust the plan?"
