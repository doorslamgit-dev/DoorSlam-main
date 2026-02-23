# CLAUDE.md — Doorslam Development Reference

> Single source of truth for all development workflows, code standards, and processes.
> Loaded automatically by Claude Code on every session.

---

## 1. Project Identity

| Key | Value |
|-----|-------|
| **Project** | Doorslam — GCSE revision platform |
| **Stack** | React 18 · Vite 5 · React Router 7 · TypeScript 5.3 · Tailwind 3 · Supabase |
| **Repository** | `doorslamgit-dev/DoorSlam-main` (origin) |
| **Branches** | `main` (production) · `staging` (pre-prod) · `develop` (active dev, default) |
| **Supabase** | Project ref `hpdoircrqgoqabhnsuav` (eu-west-3) |
| **Node** | v20 · npm (not yarn/pnpm) |
| **CI** | GitHub Actions — lint → type-check → test → build |

---

## 2. Architecture

```
Entry (index.html → src/main.tsx)
  └─ Router (src/router.tsx)
       └─ Views (src/views/)
            └─ Components (src/components/)
                 └─ Hooks & Contexts (src/hooks/, src/contexts/)
                      └─ Services (src/services/)
                           └─ Types & Utils (src/types/, src/utils/)
                                └─ Supabase (src/lib/supabase.ts)
```

### Directory conventions

| Directory | Purpose |
|-----------|---------|
| `src/router.tsx` | React Router route definitions |
| `src/main.tsx` | App entry point (ReactDOM, BrowserRouter, Providers) |
| `src/components/ui/` | Reusable base components (Button, Modal, FormField, etc.) |
| `src/components/<domain>/` | Domain components (child/, parent/, session/, etc.) |
| `src/components/layout/` | AppShell, Sidebar, AppLayout |
| `src/services/` | Business logic and Supabase API calls |
| `src/hooks/` | Custom React hooks |
| `src/contexts/` | React Context providers (Auth, Theme, Sidebar) |
| `src/types/` | TypeScript type definitions |
| `src/utils/` | Pure utility functions |
| `src/lib/` | External library setup (Supabase client) |
| `src/styles/` | CSS design tokens (themes.css) |
| `src/constants/` | Static constants |
| `docs/` | Documentation (PRODUCT_EVOLUTION, DOCUMENTATION_STANDARDS, ADRs) |
| `reference documents/` | PRD, feature list, playbook, RPC specs |

### Key patterns

- **RBAC**: Parent/child roles via `AuthContext` — routes protected by role
- **Child selection**: `activeChildId` in AuthContext, synced with `?child=<id>` URL param
- **Service layer**: All Supabase calls wrapped in typed service functions — never call Supabase directly from components
- **State management**: React Context only (Auth, Theme, Sidebar) — no Redux
- **Components**: all components are client-rendered (Vite SPA — no server components)
- **Design tokens**: CSS custom properties in `src/styles/themes.css`, extended by Tailwind config
- **Dark mode**: `darkMode: 'class'` on `<html>`, toggled via ThemeContext

---

## 3. Code Standards

### TypeScript

- **Strict mode**: ON (`"strict": true` in tsconfig.json)
- **No `any`**: Use `unknown` for untyped data. Zero tolerance — ESLint warns, CI enforces zero warnings
- **Path alias**: `@/` maps to `./src/` — use for all non-relative imports
- **Catch blocks**: Always type error as `unknown`, then narrow

### ESLint (flat config, v9+)

- **Zero-warning policy**: 0 errors AND 0 warnings required. CI fails on any warning
- **No `eslint-disable`** without an explanatory comment on the same line
- **Unused vars**: prefix with `_` to suppress (e.g., `_event`)
- Config: `eslint.config.js`

### Prettier

```
semi: true | singleQuote: true | trailingComma: es5 | printWidth: 100 | tabWidth: 2
```

### Naming conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `DashboardHeroCard.tsx` |
| Types/Interfaces | PascalCase | `SessionProgress` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Services | camelCase with `Service` suffix | `gamificationService.ts` |
| Utilities | camelCase | `dateUtils.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Route directories | kebab-case | `app/parent/onboarding/` |
| CSS classes | Tailwind utilities | `bg-primary-600 dark:bg-primary-700` |

### Import order

```typescript
// 1. React / React Router
import React from 'react';
import { useNavigate } from 'react-router-dom';

// 2. External libraries
import { BarChart } from 'recharts';

// 3. Internal (@/ alias)
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

// 4. Relative imports
import { formatDate } from '../utils';

// 5. Types (last)
import type { SessionProgress } from '@/types/session';
```

### Error handling

- `unknown` in all catch blocks — narrow with type guards
- Services return typed results, not thrown errors
- `ErrorBoundary` at route level for unexpected failures
- Log errors with context (component name, operation, user role)

---

## 4. Development Workflows — By Change Type

> Every workflow ends with the same gate: **all CI checks must pass before merge**.

### 4a. Feature — `feature/<description>`

```bash
# 1. Start from latest develop
git checkout develop && git pull origin develop
git checkout -b feature/<description>

# 2. Develop — commit with conventional commits
git commit -m "feat(scope): description"

# 3. Before pushing — run the full check
npm run lint && npm run type-check && npm run test && npm run build

# 4. Push and create PR
git push -u origin feature/<description>
gh pr create --base develop
```

| Requirement | Details |
|-------------|---------|
| **Commits** | `feat(scope): description` |
| **Scopes** | auth, dashboard, session, timetable, gamification, subscription, insights, onboarding, layout, ui |
| **Tests** | Required — at minimum, smoke tests for new components |
| **Docs** | CHANGELOG.md (`### Added`) + PRODUCT_EVOLUTION.md (new section) + ADR (if architectural decision) |
| **PR base** | `develop` |
| **Merge** | Squash merge |

### 4b. Bug Fix — `bugfix/<description>`

```bash
git checkout develop && git pull origin develop
git checkout -b bugfix/<description>
git commit -m "fix(scope): description"
```

| Requirement | Details |
|-------------|---------|
| **Commits** | `fix(scope): description` |
| **PR body** | Must include root cause analysis |
| **Tests** | Regression test required — must prove the bug is fixed and won't recur |
| **Docs** | CHANGELOG.md (`### Fixed`) + PRODUCT_EVOLUTION.md (amend affected feature's section) |
| **PR base** | `develop` |
| **Merge** | Squash merge |

### 4c. Hotfix — `hotfix/<description>`

> **When to use**: production is broken and cannot wait for the normal develop → staging → main flow.

```bash
# 1. Branch from MAIN (not develop)
git checkout main && git pull origin main
git checkout -b hotfix/<description>
git commit -m "fix(scope): critical description"

# 2. PR directly to main
git push -u origin hotfix/<description>
gh pr create --base main

# 3. After merge to main — backport to develop
git checkout develop && git pull origin develop
git cherry-pick <hotfix-commit-sha>
git checkout -b bugfix/backport-<description>
git push -u origin bugfix/backport-<description>
gh pr create --base develop
```

| Requirement | Details |
|-------------|---------|
| **Commits** | `fix(scope): description` |
| **PR body** | Root cause + fix + post-mortem note |
| **Tests** | Regression test required |
| **Docs** | CHANGELOG.md only (under current version heading, not `[Unreleased]`) |
| **PR base** | `main` (then backport PR to `develop`) |
| **Merge** | Squash merge |

### 4d. Enhancement / Change Request

Same workflow as Feature (4a), with these differences:

| Requirement | Details |
|-------------|---------|
| **Commits** | `feat(scope): description` or `refactor(scope): description` |
| **PR body** | Must reference the original feature being enhanced |
| **Docs** | CHANGELOG.md (`### Changed`) + PRODUCT_EVOLUTION.md (add "Subsequent changes" to existing section) |

### 4e. Refactor — `refactor/<description>`

```bash
git checkout develop && git pull origin develop
git checkout -b refactor/<description>
git commit -m "refactor(scope): description"
```

| Requirement | Details |
|-------------|---------|
| **Hard rule** | Behaviour MUST NOT change. All existing tests must pass unchanged |
| **Commits** | `refactor(scope): description` |
| **Tests** | Existing tests must pass. New tests only if restructuring test infrastructure |
| **Docs** | CHANGELOG.md (`### Changed`) + ADR if changing an architectural pattern. No PRODUCT_EVOLUTION update |
| **PR base** | `develop` |

### 4f. Chore — `chore/<description>`

For: dependency updates, CI changes, tooling, config.

```bash
git checkout develop && git pull origin develop
git checkout -b chore/<description>
git commit -m "chore(scope): description"
```

| Requirement | Details |
|-------------|---------|
| **Commits** | `chore(scope): description` |
| **Docs** | Mark N/A in PR template with brief explanation |
| **Exception** | If a dependency update changes behaviour → full documentation required |
| **PR base** | `develop` |

### 4g. Documentation — `docs/<description>`

For: documentation-only changes, no code.

```bash
git checkout develop && git pull origin develop
git checkout -b docs/<description>
git commit -m "docs(scope): description"
```

| Requirement | Details |
|-------------|---------|
| **Commits** | `docs(scope): description` |
| **Tests** | Not required (build pass only) |
| **PR base** | `develop` |

---

## 5. Git Workflow

### Commit message format

```
<type>(scope): short description

[optional body — explain WHY, not what]

[optional footer — e.g., Closes #123]
```

| Prefix | When to use |
|--------|------------|
| `feat` | New functionality |
| `fix` | Bug fix |
| `refactor` | Code restructure, no behaviour change |
| `chore` | Dependencies, CI, tooling, config |
| `docs` | Documentation only |
| `test` | Test additions or fixes |
| `style` | Formatting (should be rare — Prettier handles this) |
| `perf` | Performance improvement |

### Branch rules

- **Never commit directly** to `main`, `staging`, or `develop`
- All changes via feature branches → PR → squash merge
- Delete branches after merge (GitHub auto-deletes)
- Branch names: `<type>/<short-description>` (lowercase, hyphens)

### Promotion path

```
feature/bugfix/chore branches
       │
       ▼
    develop  ←── squash merge (CI must pass)
       │
       ▼
    staging  ←── PR from develop (CI must pass)
       │
       ▼
      main   ←── PR from staging (CI must pass + sign-off required)
```

### Merge quirk

`gh pr merge` returns 401 on this repo. Use instead:

```bash
gh api repos/doorslamgit-dev/DoorSlam-main/pulls/<PR_NUMBER>/merge \
  -X PUT -f merge_method=squash
```

---

## 6. Documentation Requirements

### Which docs for which change type

| Change type | CHANGELOG | PRODUCT_EVOLUTION | ADR |
|------------|:---------:|:----------------:|:---:|
| Feature | Yes (`### Added`) | Yes (new section) | If architectural |
| Bug fix | Yes (`### Fixed`) | Yes (amend section) | No |
| Hotfix | Yes (current version) | No | No |
| Enhancement | Yes (`### Changed`) | Yes (subsequent changes) | If architectural |
| Refactor | Yes (`### Changed`) | No | If pattern change |
| Chore | N/A | N/A | N/A |
| Docs | N/A | N/A | N/A |

### CHANGELOG format

Follow [Keep a Changelog](https://keepachangelog.com/) under `[Unreleased]`:

```markdown
### Added
- **FEAT-NNN: Feature Title** — one-line description
  - Key file or change detail
  - Another detail
```

Change types: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`

### PRODUCT_EVOLUTION format

```markdown
## Feature Name (Date)

**Why this change is happening**: plain English problem statement
**What it does**: description a non-developer could understand
**How it was developed**: technical approach, key files, patterns
**Subsequent changes**: added later if feature is modified
```

### ADR format

File: `docs/decisions/ADR-NNN-short-description.md`

Numbering: sequential, never reuse. **Next available: ADR-005**

```markdown
# ADR-NNN: Short Title

## Status
Accepted | Superseded by ADR-NNN | Deprecated

## Date
YYYY-MM-DD

## Context
What is the problem or situation that requires a decision?

## Decision
What was decided and why?

## Alternatives Considered
What other approaches were evaluated? Why were they rejected?

## Consequences
### Positive
- Benefits of this decision

### Negative
- Trade-offs and known limitations

### Follow-up work
- Things that need to happen later as a result
```

### Feature codes

Features tracked as `FEAT-NNN` codes — see `reference documents/RevisionHub_Feature_List.md` and `reference documents/RevisionHub_PRD_v9_0.md`.

Full standards: [`docs/DOCUMENTATION_STANDARDS.md`](docs/DOCUMENTATION_STANDARDS.md)

---

## 7. CI/CD Pipeline

### GitHub Actions (`.github/workflows/ci.yml`)

**Triggers**: PRs to develop/staging/main, pushes to develop

**Stages** (all must pass):

```
npm ci → npm run lint → npm run type-check → npm run test → npm run build
```

### Pre-push local check

Run this before every push to catch issues before CI:

```bash
npm run lint && npm run type-check && npm run test && npm run build
```

### Available scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + Vite production build |
| `npm run build:check` | Type-check + Vite build (same as build) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint (src) |
| `npm run type-check` | TypeScript `tsc --noEmit` |
| `npm test` | Vitest (single run) |
| `npm run test:watch` | Vitest (watch mode) |
| `npm run test:coverage` | Vitest with coverage |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |

---

## 8. AI Tutor Development

The AI Tutor is a RAG-powered revision assistant with a Python/FastAPI backend and React frontend. Both run together in development.

### Starting the dev environment

```bash
# Option 1: Single script (starts both servers, Ctrl+C stops both)
./scripts/dev-start.sh

# Option 2: API only
./scripts/dev-start.sh --api

# Option 3: Manual — two terminals
# Terminal 1 — FastAPI backend (from repo root)
cd ai-tutor-api && source venv/bin/activate && uvicorn src.main:app --reload --port 8000

# Terminal 2 — Vite frontend (from repo root)
npm run dev
```

### Architecture

| Component | Location | Port | Purpose |
|-----------|----------|------|---------|
| Vite dev server | `/` | 5173 | React SPA frontend |
| FastAPI backend | `ai-tutor-api/` | 8000 | AI Tutor chat + ingestion API |
| Supabase | Remote | — | Auth, database (`public` + `rag` schemas) |

Vite proxies `/api/ai-tutor/*` → `localhost:8000` in development (configured in `vite.config.ts`).

### Environment variables

Two `.env` files are required:

| File | Key variables |
|------|---------------|
| `.env` (repo root) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| `ai-tutor-api/.env` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `LANGCHAIN_*` |

Templates: `.env.example` (root) and `ai-tutor-api/.env.example`.

### Backend testing

```bash
cd ai-tutor-api && ./venv/bin/python -m pytest tests/ -v
```

Note: tests must run from the `ai-tutor-api/` directory so Pydantic Settings can find `.env`.

### Backend directory structure

```
ai-tutor-api/
├── src/
│   ├── main.py             # FastAPI app, CORS, routes
│   ├── config.py           # Pydantic Settings (env vars)
│   ├── auth.py             # JWT validation dependency
│   ├── api/chat.py         # POST /chat/stream — SSE streaming
│   └── models/chat.py      # Request/response Pydantic models
├── tests/
├── venv/                   # Python virtual environment (gitignored)
├── .env                    # Secrets (gitignored)
├── .env.example            # Template
├── pyproject.toml          # Project metadata
└── requirements.txt        # pip dependencies
```

### Key endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/chat/stream` | SSE streaming chat (requires JWT) |

### Adding Python dependencies

```bash
cd ai-tutor-api && ./venv/bin/pip install <package> && ./venv/bin/pip freeze > requirements.txt
```

Or edit `requirements.txt` manually and run `./venv/bin/pip install -r requirements.txt`.

---

## 9. Testing Policy

### When tests are required

| Change type | Tests required? |
|------------|:--------------:|
| Feature | Yes — smoke tests minimum |
| Bug fix | Yes — regression test |
| Hotfix | Yes — regression test |
| Enhancement | Yes — for new behaviour |
| Refactor | Existing tests must pass |
| Chore | No |
| Docs | No |

### Stack

- **Runner**: Vitest
- **Rendering**: @testing-library/react
- **DOM**: jsdom
- **Setup**: `src/test/setup.ts` (imports `@testing-library/jest-dom`)

### Test file conventions

- **Naming**: `*.test.ts` or `*.test.tsx`
- **Location**: co-located with source file OR in `src/test/`
- **Imports**: use `@/` alias, same as source code

---

## 10. Code Review Standards

### Reviewer checklist

- [ ] Functionality works as described in the PR
- [ ] Type-safe — no `any`, no unsafe assertions
- [ ] Zero ESLint warnings (not just errors)
- [ ] Tests cover new/changed behaviour
- [ ] Documentation updated per Section 6 table
- [ ] No secrets, API keys, or .env values in code
- [ ] No unnecessary `eslint-disable` comments
- [ ] PR description includes context and test plan

### PR size guideline

Prefer PRs under **400 lines changed**. For larger work, split into stacked PRs with clear dependency order. This is a guideline — exceptions are fine for tightly coupled changes.

### Process

1. All CI checks must pass before requesting review
2. Fill out the PR template completely (`.github/pull_request_template.md`)
3. Add screenshots/video for UI changes
4. Reviewer approves → squash merge → delete branch

---

## 11. Release & Versioning

### Semantic Versioning

| Bump | When | Example |
|------|------|---------|
| **PATCH** (x.x.1) | Bug fixes, no behaviour change | `3.0.0 → 3.0.1` |
| **MINOR** (x.1.0) | New features, backwards compatible | `3.0.1 → 3.1.0` |
| **MAJOR** (x.0.0) | Breaking changes, layout overhauls | `3.1.0 → 4.0.0` |

### Release process

1. Move CHANGELOG.md `[Unreleased]` entries into a new version heading
2. Update `version` in `package.json`
3. Create PR from `develop` → `staging` (CI must pass)
4. After staging validation, create PR from `staging` → `main` (requires sign-off)
5. Tag release on main: `git tag v<version>`

### Promotion gates

| Promotion | Gate |
|-----------|------|
| develop → staging | CI green |
| staging → main | CI green + sign-off |

---

## 12. Environment & Secrets

### Rules

- `.env` is gitignored — **NEVER commit secrets**
- `.env.example` is the template — update it when adding new env vars
- All browser-exposed vars use `VITE_` prefix (Vite convention)

### Required variables

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

### Optional variables

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_<key>
```

---

## 13. Additional Policies

### Dependency management

- Add production dep: `npm install <package>`
- Add dev dep: `npm install -D <package>`
- Always commit `package-lock.json` alongside `package.json`
- Major version bumps require testing + a `chore/` PR
- No Dependabot/Renovate — manual dependency review

### Rollback procedure

If a deploy to staging or main causes issues:

1. `git revert <merge-commit-sha>` — create a revert commit
2. PR the revert to the affected branch
3. Investigate root cause on a new `bugfix/` or `hotfix/` branch
4. **Never force-push** protected branches (main, staging, develop)

### Security practices

- No secrets in code or commits — use environment variables
- Supabase Row Level Security (RLS) for all database tables
- Input validation at service boundaries (where external data enters)
- Use `unknown` (not `any`) for data from external sources
- Sanitise user-generated content before rendering (XSS prevention)

### File creation rules

- Prefer editing existing files over creating new ones
- New components → `src/components/<domain>/`
- New services → `src/services/` or `src/services/<domain>/`
- New types → `src/types/` or `src/types/<domain>/`
- New hooks → `src/hooks/` or `src/hooks/<domain>/`
- New utilities → `src/utils/`

---

## 14. Test Accounts

These are Supabase test accounts for local development and testing. All agents should use these when testing authenticated flows.

| Role | Email | Password |
|------|-------|----------|
| **Parent** | `jsmith@example.com` | `N0rt0nBavant!` |
| **Child** | `hannah@example.com` | `N0rt0nBavant!` |
| **Child** | `johnny@example.com` | `N0rt0nBavant!` |

---

## Quick Reference

### Before you push

```bash
npm run lint && npm run type-check && npm run test && npm run build
```

### New feature checklist

1. Branch from develop: `feature/<name>`
2. Conventional commits: `feat(scope): description`
3. Write tests
4. Update: CHANGELOG.md + PRODUCT_EVOLUTION.md + ADR (if needed)
5. Run pre-push checks
6. `gh pr create --base develop`

### Key files

| File | Purpose |
|------|---------|
| `CHANGELOG.md` | Version history |
| `docs/PRODUCT_EVOLUTION.md` | Plain-English feature catalog |
| `docs/DOCUMENTATION_STANDARDS.md` | Full documentation policy |
| `docs/decisions/ADR-*.md` | Architectural decisions |
| `.github/pull_request_template.md` | PR checklist |
| `.github/workflows/ci.yml` | CI pipeline definition |
| `vite.config.ts` | Vite + Vitest config |
| `eslint.config.js` | Linting rules |
| `tsconfig.json` | TypeScript config |
| `.prettierrc` | Formatting config |
