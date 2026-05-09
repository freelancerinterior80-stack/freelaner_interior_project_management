# Phase 0 Product Architecture

## Product Positioning

This app is a mobile-first owner-control platform for a construction, interior design, fit-out, furniture, renovation, or contracting business. It is designed for one primary user: the business owner managing work from a phone.

The product must stay intentionally smaller than an ERP. Every screen should answer one of three questions quickly:

- What needs my attention today?
- Is this project profitable?
- Can I create, share, or record the next business document in seconds?

## Core Product Principles

1. Mobile first, desktop compatible.
2. Important actions reachable within 2-3 taps.
3. Forms are short, progressive, and save automatically where possible.
4. BOQ is the center of the workflow.
5. Documents are generated from existing data, not retyped.
6. Offline support favors continuity: cached views, draft entries, and later sync.
7. English and Arabic are first-class layout modes, including RTL.

## Architecture Overview

```text
Next.js App Router PWA
  |
  |-- Server Components for authenticated data views
  |-- Client Components for mobile editing, upload, offline queues
  |-- Server Actions / Route Handlers for mutations and exports
  |
Supabase
  |
  |-- Auth: email OTP/password and phone OTP
  |-- PostgreSQL: normalized operational data
  |-- Storage: images, videos, PDFs, Excel files
  |-- RLS: owner-scoped access to all records
  |
Supporting Libraries
  |
  |-- shadcn/ui: accessible UI primitives
  |-- Tailwind CSS: design system and responsive layout
  |-- React Hook Form + Zod: forms and validation
  |-- Zustand: local UI state and offline draft queue
  |-- React PDF: quotation, invoice, BOQ, report documents
  |-- Recharts: simple dashboard/report charts
  |-- Framer Motion: small, purposeful transitions
```

## Application Layers

### App Layer

The `app/` directory owns routing, layouts, loading states, error boundaries, and protected route groups.

Key route groups:

- `(auth)` for login and verification.
- `(app)` for authenticated mobile-first product screens.
- `api` for file export, import, webhooks, and server-only tasks.

### Feature Layer

Each business module has a feature folder with UI, queries, mutations, validation schemas, and types.

Primary features:

- `dashboard`
- `projects`
- `boq`
- `documents`
- `expenses`
- `materials`
- `payments`
- `progress`
- `reports`
- `settings`

### Domain Layer

Shared business rules live in `lib/domain/`.

Examples:

- BOQ line total = quantity x unit rate.
- BOQ subtotal = sum of active BOQ item totals.
- Quotation total = subtotal + tax - discount.
- Invoice balance = invoice total - linked client payments.
- Project profit = recognized client payments - project expenses - supplier payments.

### Infrastructure Layer

Supabase clients, storage helpers, auth guards, PDF rendering, Excel parsing, offline syncing, and i18n live in `lib/`.

## Folder Structure

```text
freelaner_interior_project_management/
  app/
    (auth)/
      login/
        page.tsx
      verify/
        page.tsx
    (app)/
      layout.tsx
      dashboard/
        page.tsx
      projects/
        page.tsx
        new/
          page.tsx
        [projectId]/
          page.tsx
          boq/
            page.tsx
          expenses/
            page.tsx
          progress/
            page.tsx
          files/
            page.tsx
      boq/
        page.tsx
        templates/
          page.tsx
      quotations/
        page.tsx
        [quotationId]/
          page.tsx
      invoices/
        page.tsx
        [invoiceId]/
          page.tsx
      expenses/
        page.tsx
      materials/
        page.tsx
      payments/
        page.tsx
      reports/
        page.tsx
      settings/
        page.tsx
    api/
      exports/
        boq/[id]/route.ts
        quotation/[id]/route.ts
        invoice/[id]/route.ts
        report/[id]/route.ts
      imports/
        boq/route.ts
      webhooks/
        supabase/route.ts
  components/
    app-shell/
      bottom-nav.tsx
      mobile-header.tsx
      desktop-sidebar.tsx
      floating-action-button.tsx
    cards/
      metric-card.tsx
      project-card.tsx
      payment-card.tsx
    forms/
      money-input.tsx
      date-input.tsx
      file-upload.tsx
      language-toggle.tsx
    ui/
      shadcn-components.ts
  features/
    dashboard/
      components/
      queries.ts
      types.ts
    projects/
      components/
      actions.ts
      queries.ts
      schema.ts
      types.ts
    boq/
      components/
      actions.ts
      calculations.ts
      import-export.ts
      schema.ts
      types.ts
    documents/
      quotation-pdf.tsx
      invoice-pdf.tsx
      boq-pdf.tsx
      report-pdf.tsx
      calculations.ts
    expenses/
    materials/
    payments/
    progress/
    reports/
    settings/
  lib/
    auth/
      guards.ts
      session.ts
    domain/
      money.ts
      documents.ts
      project-profit.ts
    i18n/
      config.ts
      dictionaries/
        en.json
        ar.json
    offline/
      queue.ts
      sync.ts
      storage.ts
    supabase/
      browser.ts
      server.ts
      middleware.ts
      storage.ts
    validation/
      common.ts
    utils.ts
  public/
    manifest.webmanifest
    icons/
  supabase/
    migrations/
    schema.sql
    seed.sql
  docs/
    phase-0-product-architecture.md
    database-schema.sql
```

## Page Hierarchy

```text
Login
  -> Email login
  -> Phone login
  -> OTP verification

Dashboard
  -> Quick actions
  -> Active projects
  -> Pending payments
  -> Recent expenses
  -> Material alerts
  -> Monthly profit overview

Projects
  -> Project list
  -> Project detail
      -> Overview
      -> BOQ
      -> Expenses
      -> Progress
      -> Files
      -> Payments

BOQ
  -> BOQ list
  -> BOQ editor
  -> Templates
  -> Import Excel
  -> Export PDF/Excel
  -> Convert to quotation
  -> Convert to invoice

Quotations
  -> Quotation list
  -> Quotation detail
  -> PDF preview
  -> WhatsApp share
  -> Convert to invoice

Invoices
  -> Invoice list
  -> Invoice detail
  -> Payment status
  -> PDF preview
  -> WhatsApp share

Expenses
  -> Quick expense
  -> Daily expense list
  -> Expense detail
  -> Bill photo

Materials
  -> Material list
  -> Purchase entry
  -> Stock alert
  -> Supplier detail

Payments
  -> Client payments
  -> Supplier payments
  -> Pending reminders

Reports
  -> Project report
  -> Expense report
  -> Material report
  -> BOQ report
  -> Profit/loss report
  -> Invoice report

Settings
  -> Company profile
  -> Logo and signature
  -> Invoice template
  -> Tax settings
  -> Language and RTL
  -> Backup/export
```

## User Flow Diagrams

### Daily Owner Flow

```text
Open app
  -> Dashboard
  -> See alerts: pending payment, low stock, recent expense
  -> Tap action
  -> Add expense / record payment / open project
  -> Return to dashboard
```

### New Project Flow

```text
Dashboard FAB
  -> New project
  -> Client name, phone, location, project type, budget
  -> Save
  -> Project detail
  -> Add BOQ or upload site photos
```

### BOQ to Quotation Flow

```text
Project detail
  -> BOQ
  -> Add category
  -> Add item rows
  -> Review total
  -> Convert to quotation
  -> Apply VAT, terms, bank details
  -> Generate PDF
  -> Share by WhatsApp
```

### Quotation to Invoice Flow

```text
Quotation detail
  -> Convert to invoice
  -> Select invoice type: full, advance, milestone
  -> Confirm amount
  -> Generate PDF
  -> Mark payment status
```

### Quick Expense Flow

```text
Dashboard FAB
  -> Add expense
  -> Amount, category, project, bill photo
  -> Save
  -> Project profit updates automatically
```

### Site Progress Flow

```text
Project detail
  -> Progress
  -> Add update
  -> Upload photos/videos
  -> Add short note and progress percentage
  -> Save to timeline
```

### Offline Entry Flow

```text
No connection
  -> Cached dashboard/project remains visible
  -> Add expense or progress note
  -> Entry saved to local queue
  -> Connectivity returns
  -> Sync queue
  -> Resolve conflicts if server record changed
```

## UI/UX Structure

### App Shell

Mobile:

- Sticky top header with current context and one secondary action.
- Sticky bottom navigation with five primary tabs: Home, Projects, BOQ, Money, More.
- Floating action button for the most common create action on each screen.
- Full-screen sheets for forms instead of dense modals.

Desktop/tablet:

- Left sidebar navigation.
- Dashboard uses a two-column layout.
- Detail pages use primary content plus right summary panel.

### Navigation Model

Primary mobile tabs:

- Home
- Projects
- BOQ
- Money
- More

Money groups invoices, payments, and expenses because the owner thinks in cash movement, not accounting modules.

More contains materials, reports, progress, and settings.

### Dashboard Layout

Top section:

- Greeting and business status sentence.
- Three metrics: Income, Expense, Profit.

Action row:

- New Project
- Add Expense
- Create BOQ
- Record Payment

Attention cards:

- Pending payments
- Material alerts
- Projects needing update

Recent activity:

- Last expenses, payments, documents, progress updates.

## UI Wireframes

### Mobile Dashboard

```text
┌─────────────────────────┐
│ Good evening            │
│ Your business today     │
├─────────────────────────┤
│ Income   Expense Profit │
│ 24,000   9,500   14,500 │
├─────────────────────────┤
│ + Project  + Expense    │
│ + BOQ      + Payment    │
├─────────────────────────┤
│ Needs attention         │
│ [Payment overdue]       │
│ [Low stock: plywood]    │
├─────────────────────────┤
│ Active projects         │
│ [Villa Fit-out    65%]  │
│ [Office Interior  30%]  │
├─────────────────────────┤
│ Home Projects BOQ Money │
└─────────────────────────┘
```

### Mobile Project Detail

```text
┌─────────────────────────┐
│ < Villa Fit-out     ... │
├─────────────────────────┤
│ 65% complete            │
│ Budget 120,000          │
│ Profit 18,400           │
├─────────────────────────┤
│ BOQ       Quotation     │
│ Expenses  Progress      │
│ Files     Payments      │
├─────────────────────────┤
│ Latest update           │
│ Site ceiling completed  │
│ [photo] [photo] [video] │
├─────────────────────────┤
│ Home Projects BOQ Money │
└─────────────────────────┘
```

### Mobile BOQ Editor

```text
┌─────────────────────────┐
│ < BOQ Villa Fit-out     │
├─────────────────────────┤
│ Total 86,450            │
│ [Export] [Quotation]    │
├─────────────────────────┤
│ Ceiling works       v   │
│ Gypsum ceiling          │
│ 120 m2 x 95 = 11,400    │
│ Paint finish            │
│ 120 m2 x 18 = 2,160     │
├─────────────────────────┤
│ Flooring            >   │
├─────────────────────────┤
│              (+ item)   │
│ Home Projects BOQ Money │
└─────────────────────────┘
```

### Mobile Quick Expense

```text
┌─────────────────────────┐
│ Add expense             │
├─────────────────────────┤
│ Amount                  │
│ [  450.00          ]    │
│ Category                │
│ [Material          v]   │
│ Project                 │
│ [Villa Fit-out     v]   │
│ Bill photo              │
│ [Camera] [Upload]       │
├─────────────────────────┤
│ [Save expense]          │
└─────────────────────────┘
```

### Desktop Dashboard

```text
┌──────────────┬──────────────────────────────────────┐
│ Sidebar      │ Header: Dashboard                    │
│ Home         ├──────────────────────────────────────┤
│ Projects     │ Income | Expense | Profit | Alerts   │
│ BOQ          ├──────────────────┬───────────────────┤
│ Money        │ Active projects  │ Pending payments  │
│ Materials    │ Recent expenses  │ Monthly chart     │
│ Reports      │                  │                   │
└──────────────┴──────────────────┴───────────────────┘
```

### BOQ Mobile Editor

The BOQ editor must avoid spreadsheet complexity on mobile.

- Category cards collapse and expand.
- Each item row opens as an editable bottom sheet.
- Quantity, unit, and rate are large inputs.
- Total is shown live and read-only.
- Duplicate item and duplicate BOQ are one-tap actions.
- Desktop can show a table view, but mobile defaults to card editing.

### Document UX

Quotation, invoice, and BOQ documents share one mental model:

- Details
- Items
- Totals
- Terms
- Preview
- Share

The owner should never re-enter line items after BOQ approval.

### Visual System

Palette:

- Background: warm off-white.
- Surface: white.
- Text: charcoal.
- Secondary text: muted gray.
- Accent: warm wood.
- Positive: deep green.
- Warning: amber.
- Negative: muted red.

Interaction:

- 44px minimum touch targets.
- Bottom sheets for mobile create/edit flows.
- Subtle Framer Motion transitions for sheet entry, card press, and route change.
- No decorative complexity; visual weight comes from spacing, typography, and clear totals.

### Forms

Form rules:

- Each form starts with the minimum data needed to save.
- Advanced fields are hidden under "More details".
- All money fields use formatted numeric inputs.
- All date fields use native-friendly mobile date selection.
- File upload supports camera capture.
- Validation messages use plain business language.

## API Structure

Most CRUD should go through Supabase with RLS and typed server actions. Route handlers are reserved for work that needs server-only execution.

```text
Server actions:
  createProject
  updateProject
  createBoq
  updateBoqItem
  duplicateBoq
  createQuotationFromBoq
  createInvoiceFromQuotation
  createExpense
  recordPayment
  createProgressUpdate

Route handlers:
  POST /api/imports/boq
  GET  /api/exports/boq/:id
  GET  /api/exports/quotation/:id
  GET  /api/exports/invoice/:id
  GET  /api/exports/report/:id
```

## Data Ownership and Security

The app is single-owner first, but the schema supports future team access.

- `profiles` maps Supabase auth users to app users.
- Every business table has `owner_id`.
- RLS policies restrict records to `auth.uid() = owner_id`.
- Future staff permissions can be added through `organization_members`.
- Storage paths are owner-scoped.
- All mutations validate input with Zod before writing.

## Offline Strategy

Phase 1:

- PWA install support.
- Cache shell and recent dashboard/project data.

Phase 4:

- IndexedDB-backed offline queue.
- Supported offline drafts: expenses, progress updates, project notes, BOQ item edits.
- Sync processor retries when online.
- Conflict policy: server wins for financial documents after issue; drafts remain editable before issue.

## Phase Roadmap

### Phase 1: Foundation, Auth, Dashboard, Projects

Deliverables:

- Next.js App Router project scaffold.
- Tailwind, shadcn/ui, Framer Motion setup.
- Supabase Auth with email and phone login.
- Protected routes and session persistence.
- Mobile app shell with bottom nav and FAB.
- Dashboard with active projects, pending payments, expenses, and profit metrics.
- Project CRUD with files and progress percentage.
- Initial RLS policies.

Acceptance criteria:

- Owner can log in from phone.
- Owner can create and view projects in under 30 seconds.
- Dashboard totals are calculated from real tables.
- Unauthenticated users cannot access app routes.

### Phase 2: BOQ, Quotation, Invoice

Deliverables:

- Mobile BOQ editor with categories and item cards.
- BOQ calculations and templates.
- Duplicate BOQ.
- Excel import/export.
- BOQ PDF export.
- Convert BOQ to quotation.
- Convert quotation to invoice.
- Quotation and invoice PDF templates with company profile, logo, signature, VAT, terms, bank details, and Arabic/English support.
- WhatsApp share links.

Acceptance criteria:

- Owner can build a BOQ on mobile without a spreadsheet UI.
- BOQ totals, quotation totals, and invoice totals match database calculations.
- Generated PDFs are professional and shareable.

### Phase 3: Expenses, Materials, Payments

Deliverables:

- Quick expense entry with bill photo upload.
- Expense categories and project attachment.
- Material purchases, suppliers, stock movements, and low-stock alerts.
- Client payments, supplier payments, advance payments, and reminders.
- Project profitability view.

Acceptance criteria:

- Adding an expense updates project profit.
- Recording a payment updates invoice/payment status.
- Low-stock materials appear on dashboard.

### Phase 4: Reports, Analytics, Offline

Deliverables:

- Project, expense, material, BOQ, profit/loss, and invoice reports.
- Recharts-based analytics.
- PWA offline cache.
- Offline draft queue and sync.
- Backup/export settings.
- Final polish for RTL and Arabic.

Acceptance criteria:

- Key reports can be generated as PDFs.
- Recent project data remains viewable offline.
- Offline entries sync when the connection returns.

## Implementation Approval Gate

Coding should begin only after this phase-0 plan is approved. The recommended first coding milestone is Phase 1 foundation: scaffold the Next.js app, install the stack, create Supabase clients, add auth routes, and build the mobile shell.
