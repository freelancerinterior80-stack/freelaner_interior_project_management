# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with Turbopack (http://localhost:3000)
npm run build        # Production build
npm run typecheck    # TypeScript strict check (no emit)
npm run lint         # ESLint
```

No test suite is configured. Verification is done via `typecheck` + `build` + manual smoke tests against the routes listed in README.md.

## Environment

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

When Supabase variables are absent, the app runs in **demo mode** with hardcoded sample data — all UI can be reviewed without a database.

## Architecture

**Next.js App Router** with two route groups:
- `app/(auth)/` — login + OTP verification (public)
- `app/(app)/` — all authenticated routes behind middleware guard

**Feature modules** in `features/` are the core of the app. Each module owns its queries, components, forms, and types. API routes in `app/api/` handle PDF/CSV exports and offline sync — they are thin wrappers that pull data from Supabase and delegate to renderers in `features/documents/`.

**Supabase** is the only backend. Three client flavors:
- `lib/supabase/client.ts` — browser client (used in Client Components)
- `lib/supabase/server.ts` — server client (Server Components, API routes)
- `lib/supabase/middleware.ts` — session refresh in Next.js middleware

Row Level Security is enforced at the database level — every table is owner-scoped to `auth.uid()`.

**State management**: Zustand with persistence for the offline draft queue (`features/offline/`). Offline drafts are flushed to `/api/offline-sync` when the connection returns.

**PDF generation**: `@react-pdf/renderer` rendered server-side inside API route handlers. Company settings (logo, signature, VAT, bank details) are fetched from Supabase and injected into every PDF.

**BOQ module** is the most important — it drives quotation and invoice generation. BOQ totals are calculated via PostgreSQL generated columns/triggers in live mode and client-side in demo mode.

## Key Design Rules (from AGENTS.md)

- **Mobile-first, WhatsApp-simple UX** — max 2–3 taps for any important action; large touch-friendly cards; floating action buttons; sticky bottom navigation.
- **This is not an ERP** — avoid adding complexity or enterprise patterns not already present.
- The Tailwind config has a custom `wood` and `charcoal` palette — use these tokens instead of raw hex values.
- shadcn/ui is configured with the `new-york` style and `lucide` icons — add new primitives via `shadcn` CLI, not by hand.
- Arabic/RTL support is in scope; keep layout and text direction in mind when adding UI.

## Database

Schema lives in `supabase/migrations/`. To apply locally, run the SQL files against your Supabase project. The primary migration (`20260509183000_initial_schema.sql`) defines all enums, tables, RLS policies, and the stock-adjustment RPC used by the materials module.

## Planned next work (from README)

- Native `.xlsx` import/export (currently CSV-based).
- Restore/import flow for the JSON backup export.
