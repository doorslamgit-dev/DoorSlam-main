# ADR-011: Admin Role Architecture

## Status
Accepted

## Date
2026-02-27

## Context
The curriculum extraction pipeline backend is complete and can stage extracted topics in `curriculum_staging`. Doorslam staff need a frontend to review, approve, and manage this data. This requires a way to distinguish admin users from consumer users (parents and children), a dedicated admin UI area, and appropriate database access controls.

Key constraints:
- Admin accounts are for Doorslam internal staff only — not consumers
- The admin area must be completely separate from the parent/child experience
- No self-registration for admin accounts (created via seed/CLI/SQL only)
- The architecture should support adding more admin tools over time
- Must integrate with the existing Supabase auth and RLS system

## Decision
Add `admin` as a new value in the existing `user_role` PostgreSQL enum, rather than creating a separate auth system or using a boolean flag.

### Routing
- Admin routes live under `/admin/*` with their own `AdminLayout` component
- `AdminLayout` is role-gated: redirects non-admin users to `/login`
- `AppLayout` detects admin routes via `pathname.startsWith("/admin")` and passes through without the consumer app shell (no sidebar, subscription gate, or child selector)
- `HomePage` auto-redirects admin users to `/admin`

### Database access
- RLS policies check `profiles.role = 'admin'::user_role` for admin-specific operations
- Admin policies are additive — they don't modify existing parent/child policies
- Admin accounts have no `activeChildId` and bypass the subscription gate

### Account creation
- Admin accounts are created manually via SQL insert into `profiles` table after creating the auth user in Supabase
- No self-registration flow — this is intentional to prevent unauthorized admin access

## Alternatives Considered

### Separate auth system for admins
A completely separate login flow and user table for admin accounts.
- **Rejected**: Unnecessary complexity. The existing Supabase auth + profiles pattern handles multiple roles well. Adding a third role value is the minimal change.

### Boolean `is_admin` flag on profiles
Adding `is_admin: boolean` column instead of extending the enum.
- **Rejected**: Leads to ambiguous state (what if `role = 'parent'` AND `is_admin = true`?). The enum approach is cleaner and maps directly to RLS policy checks.

### Supabase custom claims (JWT)
Storing admin status in JWT custom claims rather than the profiles table.
- **Rejected**: Custom claims require edge function or webhook setup, adds deployment complexity, and diverges from the existing profile-based role pattern used for parent/child.

## Consequences

### Positive
- Minimal code change — extends existing enum, reuses existing auth patterns
- Clean separation: admin layout, routes, and RLS are all independent from consumer code
- Extensible: new admin tools just add routes under `/admin/*` and nav items to `ADMIN_NAV`
- RLS-enforced: even if someone navigates to `/admin`, they can't read data without the admin role

### Negative
- Admin users cannot also be parents/children (single role per profile)
- No self-service admin creation — requires manual SQL or future admin management tool
- `user_role` enum changes require a migration (cannot be easily reverted in PostgreSQL)

### Follow-up work
- Create a seed script or admin CLI tool for creating admin accounts
- Consider adding admin user management page as a future admin tool
- Evaluate whether admin audit logging is needed for curriculum operations
