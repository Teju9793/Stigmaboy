# STIGMABOY Platform

Creator commerce platform for courses, templates, and edit services.

**Stack:** Next.js 14 · TypeScript · Tailwind CSS · Supabase · Razorpay · Vercel

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/your-org/stigmaboy.git
cd stigmaboy
npm install
```

### 2. Environment variables

```bash
cp .env.local.example .env.local
# Fill in all values — see .env.local.example for descriptions
```

### 3. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in order in the SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_seed_data.sql`
3. Enable Google OAuth in **Authentication → Providers → Google**
4. Set Site URL to `http://localhost:3000` (dev) or your domain (prod)
5. Add `http://localhost:3000/api/auth/callback` to Redirect URLs

### 4. Promote yourself to admin

After creating your first account via the app, run in Supabase SQL Editor:

```sql
UPDATE public.user_profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your@email.com' LIMIT 1
);
```

### 5. Start dev server

```bash
npm run dev
# Open http://localhost:3000
```

---

## Project Structure

```
src/
  app/
    (public)/        Public routes — home, courses, templates
    (auth)/          Login, register
    (dashboard)/     Protected user dashboard
    (admin)/         Admin panel (role: admin only)
    api/             API routes
  components/
    ui/              Design system components
    layout/          Navbar, Footer, MobileNav
    courses/         Course-specific components (Phase 2)
    templates/       Template-specific components (Phase 3)
    checkout/        Cart and payment components (Phase 4)
    admin/           Admin panel components (Phase 5)
  lib/
    supabase/        Client, server, middleware helpers
    utils/           format, audit, ratelimit, api-error
    validations/     Zod schemas
  hooks/             useUser, useCart, useCourse (Phase 2)
  stores/            Zustand cartStore
  types/             database.types.ts
supabase/
  migrations/        SQL migration files
  functions/         Edge functions (email)
```

---

## Development Phases

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Foundation | ✅ Complete |
| 2 | Courses | 🔄 In Progress |
| 3 | Templates | ⏳ Pending |
| 4 | Payments | ⏳ Pending |
| 5 | Admin Dashboard | ⏳ Pending |
| 6 | Launch Polish | ⏳ Pending |

---

## Branch Strategy

```
main        ← Production (Vercel auto-deploys)
develop     ← Integration branch
feature/*   ← Feature branches (per phase)
fix/*       ← Bug fixes
```

---

## Deployment

Deployed on Vercel. `main` branch auto-deploys via GitHub Actions.

Required secrets in GitHub:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`  
- `VERCEL_PROJECT_ID`

---

## Commit Convention

```
feat: add course listing page
fix: correct Razorpay webhook signature
chore: update dependencies
refactor: extract useCart hook
docs: update README
```
