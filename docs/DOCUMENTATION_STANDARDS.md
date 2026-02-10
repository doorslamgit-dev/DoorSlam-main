# Documentation Standards

> **Addendum to the Doorslam Engineering Operations Playbook, Section 8.**
> This document extends the playbook's documentation requirements with specific file-level standards.

---

## Why This Matters

Doorslam is built with a mix of in-house development and AI-assisted coding (Claude Code). For any developer joining the project — or returning after a break — the codebase must tell a clear story: what was built, why, and how. Code alone is not enough. Every significant change must be documented in plain English alongside the technical implementation.

---

## Documentation Lifecycle

Every feature, enhancement, or significant bug fix must update **three documentation layers** before a PR can be merged:

### 1. CHANGELOG.md (Technical — What Changed)

**Location**: `CHANGELOG.md` (repo root)
**Format**: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
**When to update**: Every PR that changes functionality

Add an entry under `[Unreleased]` with:
- The change type heading (`### Added`, `### Changed`, `### Fixed`, `### Removed`)
- A bold title describing the change
- Bullet points listing what was added/modified
- Key file paths for reference

Example:
```markdown
### Added
- **FEAT-015: Child Weekly Report** — email summary sent to parents every Monday
  - New `weeklyReportService.ts` for report generation
  - Supabase edge function `send-weekly-report` with SendGrid integration
  - Parent settings toggle for email preferences
```

When a version is released (PR to staging), move `[Unreleased]` entries into a new version heading.

### 2. docs/PRODUCT_EVOLUTION.md (Plain English — Why and How)

**Location**: `docs/PRODUCT_EVOLUTION.md`
**When to update**: Features, enhancements, and any change that alters user-facing behaviour

Add a new section with four parts:

| Section | What to write |
|---------|--------------|
| **Why this change is happening** | The user need, problem, or business reason in plain English |
| **What it does** | Description a non-developer could understand. What does the user see/experience? |
| **How it was developed** | Technical approach: key files, data flow, patterns used, trade-offs |
| **Subsequent changes** | Added later if the feature is modified — what changed and why |

For bug fixes and minor enhancements, add a note under the relevant existing feature section rather than creating a new top-level section.

### 3. docs/decisions/ADR-NNN.md (Architectural — Why This Approach)

**Location**: `docs/decisions/ADR-NNN-short-description.md`
**When to create**: Any change involving a significant technical decision

ADRs are required when:
- Choosing between multiple valid approaches (e.g., "client-side vs server-side filtering")
- Introducing a new pattern or library
- Making a trade-off with known consequences
- Changing an existing architectural pattern

ADRs are NOT required for:
- Straightforward bug fixes
- Copy/paste of an established pattern
- Cosmetic UI changes

Template:
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

---

## When Documentation Is NOT Required

These change types can skip the documentation checklist:

- **Dependency updates** (`chore(deps): upgrade React to v19`) — unless they change behaviour
- **Linting/formatting fixes** — no functional change
- **CI/CD pipeline tweaks** — unless changing the deployment model
- **Test additions** — unless they document previously undocumented behaviour

Mark the "N/A" checkbox in the PR template and add a brief explanation.

---

## Numbering Conventions

### CHANGELOG versions
Follow [Semantic Versioning](https://semver.org/) per Playbook Section 11.3:
- **PATCH** (x.x.1): bug fixes
- **MINOR** (x.1.0): new features, backwards compatible
- **MAJOR** (x.0.0): breaking changes, layout overhauls

### ADR numbers
Sequential: `ADR-001`, `ADR-002`, `ADR-003`, etc. Never reuse numbers. If a decision is superseded, add `## Status: Superseded by ADR-NNN` to the old ADR.

### Feature codes
Features are tracked with `FEAT-NNN` codes corresponding to the PRD:
- `reference documents/RevisionHub_PRD_v9_0.md`
- `reference documents/RevisionHub_Feature_List.md`

---

## Review Checklist

Reviewers should verify documentation as part of code review:

- [ ] CHANGELOG entry accurately describes the change
- [ ] PRODUCT_EVOLUTION section explains the feature in language a non-developer can follow
- [ ] ADR (if present) clearly states context, decision, and consequences
- [ ] No placeholder text or TODO markers in documentation
- [ ] File paths and cross-references are correct

---

## Cross-References

| Document | Location | Purpose |
|----------|----------|---------|
| Engineering Playbook | `reference documents/Doorslam Engineering-Operations-Playbook .pdf` | Master process document |
| This addendum | `docs/DOCUMENTATION_STANDARDS.md` | Documentation requirements |
| Changelog | `CHANGELOG.md` | Version-by-version technical changes |
| Product Evolution | `docs/PRODUCT_EVOLUTION.md` | Plain-English feature catalog |
| Architecture Decisions | `docs/decisions/ADR-*.md` | Key technical decisions |
| PR Template | `.github/pull_request_template.md` | Enforces checklist per PR |
| Feature backlog | `reference documents/RevisionHub_Feature_List.md` | Feature tracking |
| PRD | `reference documents/RevisionHub_PRD_v9_0.md` | Product requirements |
