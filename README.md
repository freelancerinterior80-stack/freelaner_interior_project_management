# Freelaner Interior Project Management

Mobile-first owner-control operations app for construction, interior design, fit-out, furniture, renovation, and contracting work.

## Phase 1 Scope

Implemented:

- Next.js App Router app scaffold.
- Tailwind CSS and local shadcn-style UI primitives.
- PWA manifest and app icons.
- Supabase auth structure for email OTP and phone OTP.
- Protected app shell with mobile header, sticky bottom navigation, desktop sidebar, and floating action button.
- Dashboard with income, expense, profit, pending payment, material alert, chart, active project, and recent expense sections.
- Project list, new project form, and project detail screen.
- Zod + React Hook Form validation.
- Supabase PostgreSQL migration copied from the approved schema draft.
- Local demo mode when Supabase environment variables are not configured.

## Phase 2 Scope

Implemented:

- BOQ list, create screen, and mobile detail/editor flow.
- BOQ categories and item cards with supported units: M2, LS, Mtr, PS, Units.
- BOQ subtotal calculations from PostgreSQL generated columns/triggers and app-side demo calculations.
- Convert BOQ to quotation.
- Convert quotation to invoice.
- Quotation and invoice list/detail screens.
- Professional React PDF exports for BOQs, quotations, and invoices.
- WhatsApp share links for generated BOQs, quotations, and invoices.
- Demo quotation and invoice data for local review without Supabase credentials.

## Phase 3 Scope

Implemented:

- Quick expense entry with project attachment, supplier capture, category, date, notes, and optional bill upload.
- Expense list with category chips and project context.
- Materials list with supplier, unit cost, current stock, low-stock threshold, and low-stock alerts.
- Material movement recording for purchases, usage, and adjustments.
- Supplier list support through expense/material/payment creation flows.
- Client-in and supplier-out payment tracking.
- Payment reminders via `reminder_at`.
- Dashboard totals now include all expenses plus completed supplier-out payments.
- Project financial summary view now treats supplier-out payments as project expense.
- Supabase stock adjustment RPC for material movements.

## Phase 4 Scope

Implemented:

- Reports dashboard for project profit, expenses by category, invoice status, BOQ totals, and low-stock materials.
- Monthly income vs expense analytics.
- Business snapshot PDF export at `/api/exports/report`.
- Production service worker for cached app shell and offline fallback.
- Offline draft queue foundation using Zustand persistence.
- Offline expense capture that saves on-device and syncs when the connection returns.
- Offline sync API with Supabase insert support for expenses and sync-entry logging for other draft types.
- Site progress timeline with notes, progress percentage updates, photo/video upload, and project deep links.
- Offline progress note drafts that sync when the connection returns.
- Settings screen for company profile, logo, signature, invoice prefixes, VAT, bank details, default terms, and English/Arabic preference.
- BOQ spreadsheet export as Excel-compatible CSV, plus CSV import with a downloadable template.
- Offline conflict review UI for failed drafts, with readable details, retry, and remove controls.
- Generated BOQ, quotation, invoice, and report PDFs now use company settings, logo, signature, VAT, currency, bank details, and default terms.
- Private JSON backup export from Settings for projects, BOQs, documents, expenses, materials, payments, progress updates, and company settings.

## Local Setup

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000/dashboard
```

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/migrations/20260509183000_initial_schema.sql`.
3. Copy `.env.example` to `.env.local`.
4. Fill:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

When these variables are missing, the app runs in demo mode with sample projects so the UI can be reviewed immediately.

## Verification

Current checks:

```bash
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

Smoke tested production routes:

- `/dashboard`
- `/projects`
- `/boq`
- `/boq/demo-boq-villa`
- `/quotations`
- `/quotations/demo-qtn-001`
- `/invoices`
- `/invoices/demo-inv-001`
- `/api/exports/boq/demo-boq-villa`
- `/api/exports/quotation/demo-qtn-001`
- `/api/exports/invoice/demo-inv-001`
- `/expenses`
- `/expenses/new`
- `/materials`
- `/payments`
- `/payments/new`
- `/reports`
- `/api/exports/report`
- `/progress`
- `/settings`
- `/api/exports/boq/demo-boq-villa/excel`
- `/api/exports/boq-template`
- `/api/exports/backup`

## Next Phase

Next work should focus on:

- Native `.xlsx` import/export if spreadsheet-heavy workflows require more than CSV.
- Restore/import flow for JSON backups.
