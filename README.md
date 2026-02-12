# Doorslam

GCSE revision platform that helps parents and children manage study sessions, track progress, and stay motivated.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions, RLS)
- **Hosting:** Vercel
- **Payments:** Stripe (subscriptions + token purchases)

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your Supabase and Stripe keys in .env

# Start dev server
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run build:check` | Type-check + build |
| `npm run preview` | Preview production build locally |

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production - deploy to prod |
| `staging` | Pre-production testing |
| `develop` | Active development (default) |

Feature branches are created from `develop` and merged back via PR.

## Project Structure

```
src/
  components/    # Reusable UI components
  contexts/      # React context providers
  hooks/         # Custom React hooks
  pages/         # Route-level page components
  services/      # API and business logic
  types/         # TypeScript type definitions
supabase/
  functions/     # Deno edge functions
  migrations/    # Database migration files
  config.toml    # Supabase CLI configuration
```
# test
