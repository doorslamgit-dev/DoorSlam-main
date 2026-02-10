# TypeScript `any` Usage Backlog

**Status**: RESOLVED (PR #15, 10 Feb 2026)
**Original count**: 165 `any` usages across 58 files
**Current count**: 0
**ESLint rule**: `@typescript-eslint/no-explicit-any` — now passes with `--max-warnings 0`

---

## Resolution Summary

All 192 ESLint warnings (165 `no-explicit-any` + 27 other rules) were eliminated in a single PR:

| Pattern | Count | Fix Applied |
|---------|-------|-------------|
| `catch (err: any)` | 59 | `catch (err: unknown)` + `err instanceof Error ? err.message : String(err)` |
| `as any` type assertions | 42 | Removed redundant casts, or replaced with specific types |
| `Record<string, any>` | 29 | `Record<string, unknown>` (hooks, services, types) |
| Function params typed `any` | 23 | Proper types: Supabase error shape, `unknown`, specific interfaces |
| `src/types/` definitions | 2 | `string \| string[]`, `TimelineSession[]` |
| Other | 10 | Case-by-case: CSS variables as `React.CSSProperties`, Recharts tooltip typing, eslint-disable for vendor APIs |

### Patterns worth noting for future code

- **Supabase error handlers**: `(error: { message?: string; details?: string; hint?: string })`
- **Supabase RPC rows**: `rows.map((r: Record<string, unknown>) => ({ ... }))`
- **Catch blocks**: `catch (err: unknown)` with `err instanceof Error` guard
- **CSS custom properties**: `{ "--var-name": value } as React.CSSProperties`
- **Vendor-prefixed APIs**: `eslint-disable` comment (e.g., `webkitAudioContext`)
- **Recharts tooltips**: `{ active?: boolean; payload?: Array<{ value?: number; name?: string; payload?: Record<string, unknown> }> }`

### Next step

Consider promoting `@typescript-eslint/no-explicit-any` from `warn` to `error` in `.eslintrc` to prevent regression.
