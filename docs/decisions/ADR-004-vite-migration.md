# ADR-004: Migrate from Next.js to Vite + React Router

## Status
Accepted

## Date
2026-02-18

## Context
The Next.js 16 dev server was repeatedly hanging during development, causing significant productivity loss. An audit of the codebase revealed that:

- Every page component used `'use client'` — no server components doing real work
- Zero API routes, zero middleware, zero server actions
- `next/image` was configured with `unoptimized: true` (equivalent to a plain `<img>`)
- The only true server component was `app/layout.tsx` (for HTML shell and metadata)
- Authentication was entirely client-side via Supabase + React Context

In practice, the app was a fully client-rendered SPA running inside a Next.js shell. Next.js was providing routing, a dev server, and nothing else — while adding framework overhead that caused reliability issues.

## Decision
Replace Next.js with Vite 5 (bundler/dev server) and React Router v7 (client-side routing).

- **Vite** was already a devDependency (used by Vitest) and is purpose-built for client-side SPAs
- **React Router** provides equivalent hooks for all Next.js navigation APIs:
  - `useRouter` → `useNavigate`
  - `useSearchParams` → `useSearchParams` (nearly identical API)
  - `usePathname` → `useLocation().pathname`
  - `useParams` → `useParams`
  - `next/link` `Link` → `react-router-dom` `Link` (prop rename: `href` → `to`)
  - `next/dynamic` → `React.lazy`

## Alternatives Considered

### 1. Fix Next.js configuration
Could investigate why the dev server was hanging (Turbopack issues, memory, etc.). Rejected because the framework provided no value to this project — fixing symptoms while keeping unnecessary complexity was not worthwhile.

### 2. Migrate to Remix
Remix uses React Router under the hood and adds server-side capabilities. Rejected because the app has no server-side needs — adding Remix would replicate the same over-engineering problem.

### 3. Keep Next.js, disable Turbopack
The Turbopack dev server was the immediate cause of hangs. Could fall back to Webpack. Rejected for the same reason as option 1 — the underlying issue is framework mismatch, not a specific bundler bug.

## Consequences

### Positive
- Dev server starts in ~200ms (was hanging indefinitely)
- Simpler mental model — no server/client component distinction
- Smaller dependency tree (removed Next.js + its transitive dependencies)
- Build completes in ~3 seconds with Vite
- Vitest config merged into Vite config (single build tool)

### Negative
- If server-side rendering or API routes are needed in the future, they would need a separate solution (e.g., a Supabase Edge Function or a dedicated API service)
- `next/image` optimization is lost (though it was already disabled via `unoptimized: true`)
- SEO metadata is now set via `index.html` `<meta>` tags only — no per-route metadata (acceptable for an authenticated app)

### Follow-up work
- Configure SPA fallback on the production hosting platform (serve `index.html` for all non-asset routes)
- Update CI environment variables from `NEXT_PUBLIC_*` to `VITE_*`
- Update `CLAUDE.md` to reflect the new stack and directory conventions
