---
description: Onboard into the AI Tutor development context
---

# AI Tutor — Session Onboard

Onboard into the current state of the AI Tutor platform build. This project follows a modular Plan → Build → Validate cycle.

## Process

1. **Read CLAUDE.md** — load project standards, workflows, and AI Tutor section

2. **Read module progress**
   - Read `PROGRESS.md` for the module status table
   - Identify the **current module** (first non-Done module)
   - Read its plan from `.agent/plans/{N}.{name}.md`

3. **Check git state**
   - `git status` — any uncommitted work?
   - `git log -5 --oneline` — recent commits
   - `git branch --show-current` — which branch are we on?
   - Is there an open PR? `gh pr list --state open --head $(git branch --show-current)`

4. **Check what's been built**
   - For the current module: which tasks from the plan are already implemented?
   - Quick scan of files mentioned in the plan — do they exist?
   - Any failing tests? `cd ai-tutor-api && ./venv/bin/python -m pytest tests/ -v --tb=short 2>&1 | tail -20`

5. **Summarise the development state**

## Output

Provide a concise status report:

```
## AI Tutor — Session Status

**Current module**: Module N — <name>
**Module status**: <Not started | In progress — Task X of Y | Blocked on ...>
**Branch**: <branch name> (ahead/behind develop by N commits)
**Open PR**: <PR link or "None">

### What's done
- <completed tasks from the plan>

### What's next
- <next task(s) to work on>

### Issues / blockers
- <any failing tests, missing config, or blockers>
```

After reporting, ask: "Ready to continue building Module N, or do you want to review the plan first?"
