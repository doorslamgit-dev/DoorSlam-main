---
description: Build an AI Tutor module from its plan
argument-hint: [module-number-or-plan-path]
---

# AI Tutor — Module Build

Execute the plan for a module. Follows the Plan → **Build** → Validate cycle.

**Argument**: `$ARGUMENTS` — module number (e.g., `2`) or path to plan file. If empty, auto-detect from `PROGRESS.md` (first non-Done module).

## Process

### Phase 1: Preparation

1. **Read CLAUDE.md** — load project standards
2. **Read PROGRESS.md** — confirm the target module
3. **Read the full plan** from `.agent/plans/{N}.{name}.md`
4. **Create the feature branch** (if not already on one):
   ```
   git checkout develop && git pull origin develop
   git checkout -b feature/ai-tutor-module{N}-<name>
   ```
   If already on the correct branch, skip.

### Phase 2: Build

5. **Execute tasks in plan order** — for each task:
   - Read the task requirements from the plan
   - Implement following CLAUDE.md standards (TypeScript strict, zero ESLint warnings, service layer patterns)
   - After each task, run a quick sanity check:
     - Backend changes: `cd ai-tutor-api && ./venv/bin/python -m pytest tests/ -v --tb=short`
     - Frontend changes: `npm run type-check`
   - Commit after each task with conventional commit:
     - `feat(ai-tutor): <task description>`
     - Or `fix(ai-tutor):` / `test(ai-tutor):` as appropriate

6. **Track progress** — use TodoWrite to track tasks from the plan. Mark each as completed when done.

### Phase 3: Validation Gate

7. **Run the full validation suite** after all tasks complete:
   ```bash
   # Backend
   cd ai-tutor-api && ./venv/bin/python -m pytest tests/ -v

   # Frontend
   npm run lint && npm run type-check && npm run test && npm run build
   ```

8. **Run plan-specific integration tests** — execute the "Integration Test" section from the plan

9. **Fix any failures** — do not proceed past this gate with failures

### Phase 4: Documentation + PR

10. **Update documentation** per CLAUDE.md Section 6:
    - `CHANGELOG.md` — entry under `[Unreleased]` → `### Added`
    - `docs/PRODUCT_EVOLUTION.md` — new section for this module
    - ADR if any architectural decisions were made
    - `PROGRESS.md` — mark module as **Done**

11. **Commit documentation**:
    ```
    docs(ai-tutor): add Module N documentation
    ```

12. **Push and create PR**:
    ```bash
    git push -u origin <branch>
    gh pr create --base develop
    ```

## Output

Report completion:

```
## Module N Build — Complete

### Tasks completed
- Task 1: <title> — <status>
- Task 2: <title> — <status>

### Files created/modified
<list>

### Test results
- Backend: X passed, Y failed
- Frontend: lint ✓ | type-check ✓ | test ✓ | build ✓

### PR
<link>

### Deviations from plan
<any changes made and why, or "None">
```
