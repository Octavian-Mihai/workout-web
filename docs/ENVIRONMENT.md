# Environment Variables & API Key Security

This document explains which files handle API keys, what goes where, and how to keep secrets safe when publishing to GitHub and deploying to Vercel.

## Quick Start

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```
2. Open your [Supabase project dashboard](https://supabase.com/dashboard) → **Settings** → **API**.
3. Copy **Project URL** and **anon public** key into `.env.local`.
4. Never commit `.env.local` — it is listed in `.gitignore`.

## Required Variables

| Variable | Description | Safe in browser? |
|----------|-------------|------------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key | Yes, with RLS enabled |

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

The `VITE_` prefix tells Vite to expose these at build time. They are embedded in the client bundle — this is intentional for Supabase SPAs.

## Files That Touch API Keys

| File | What to do | Commit to GitHub? |
|------|------------|-------------------|
| [`.env.local`](../.env.local) | Put your **real** keys here for local development | **No** — gitignored |
| [`.env.example`](../.env.example) | Placeholder names only, no real keys | **Yes** |
| [`src/lib/supabase.ts`](../src/lib/supabase.ts) | Reads `import.meta.env.VITE_*` — never hardcode keys | **Yes** |
| **Vercel Dashboard → Settings → Environment Variables** | Add both `VITE_*` vars for production/preview | N/A (not in repo) |
| [`docs/ENVIRONMENT.md`](ENVIRONMENT.md) | This guide | **Yes** |

### What NOT to put anywhere in this project

| Variable | Why |
|----------|-----|
| `SUPABASE_SERVICE_ROLE_KEY` | Bypasses Row Level Security — server-only, never in a React SPA |

## GitHub Safety

[`.gitignore`](../.gitignore) excludes:

- `.env`
- `.env.*` (includes `.env.local`, `.env.production`)
- Exception: `.env.example` is **not** ignored (safe placeholders only)

Before pushing, verify no secrets are staged:

```bash
git status
git diff
```

If you ever accidentally commit a key, rotate it immediately in the Supabase dashboard.

## Vercel Deployment

1. Import the GitHub repo in [Vercel](https://vercel.com).
2. Framework preset: **Vite**.
3. Go to **Settings → Environment Variables** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Apply to **Production**, **Preview**, and **Development** environments.
5. Redeploy after adding variables.

## Supabase Auth Redirect URLs

After deploying, add your Vercel URL to Supabase:

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your site URL (e.g. `https://your-app.vercel.app`)
3. Add redirect URL: `https://your-app.vercel.app/**`

## Database Setup

Run the migration in [`supabase/migrations/001_initial_schema.sql`](../supabase/migrations/001_initial_schema.sql) via the Supabase SQL Editor. This creates tables, RLS policies, and seeds system movements.

## How Security Works

- The **anon key** is designed to be public in client apps.
- **Row Level Security (RLS)** on every table ensures users only access their own data (`auth.uid() = user_id`).
- Without RLS, the anon key would be dangerous — the migration enables RLS on all tables.
