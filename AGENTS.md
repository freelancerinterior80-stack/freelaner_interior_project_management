You are a senior full-stack architect and product designer.

Your task is to build a production-ready mobile-first web application (PWA) for a construction/interior design company owner who manages projects personally from his phone.

The application must feel EXTREMELY SIMPLE and easy to use.

This is NOT an ERP system.

This is a lightweight owner-control operations platform for:
- Construction
- Interior design
- Fit-out
- Furniture
- Renovation
- Contracting

The owner will mostly use the app alone.

The app must work beautifully on mobile devices first, while also supporting desktop/tablet.

====================================================
CORE OBJECTIVE
====================================================

The app should help the owner:
- Track projects
- Create and manage BOQs
- Generate quotations/invoices
- Track expenses
- Manage materials
- Upload site progress photos/videos
- Monitor payments
- Generate reports
- Operate everything from mobile

The app should feel:
- Minimal
- Fast
- Modern
- Premium
- WhatsApp-simple
- Low learning curve

====================================================
TECH STACK
====================================================

Frontend:
- Next.js (latest App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion

Backend:
- Supabase

Database:
- PostgreSQL

Authentication:
- Supabase Auth

Storage:
- Supabase Storage

PDF Generation:
- React PDF

Charts:
- Recharts

State Management:
- Zustand

Forms:
- React Hook Form + Zod

Offline Support:
- PWA with caching support

Deployment:
- Vercel

====================================================
DESIGN SYSTEM
====================================================

Design Style:
- Premium minimal
- Clean spacing
- Large touch-friendly buttons
- Very easy UX
- Mobile-first
- Neutral colors
- White + charcoal + warm wood inspired palette
- Smooth animations
- Elegant dashboards

Typography:
- Modern sans-serif
- Excellent readability

UI Rules:
- Max 2-3 taps for important actions
- No complicated forms
- Big cards
- Clear hierarchy
- Floating action buttons on mobile
- Sticky bottom navigation

====================================================
APP MODULES
====================================================

1. DASHBOARD
- Active projects
- Pending payments
- Recent expenses
- Material alerts
- Monthly revenue
- Monthly expense
- Profit overview
- Quick actions

2. PROJECT MANAGEMENT
Each project should include:
- Client info
- Site location
- Project type
- Status
- Budget
- Start/end date
- Progress percentage
- Notes
- Site photos/videos
- Documents

3. BOQ MODULE
This is the MOST IMPORTANT module.

BOQ Features:
- Categories
- Subcategories
- Item rows
- Description
- Qty
- Unit
- Unit rate
- Total
- Notes

Supported units:
- M²
- LS
- Mtr
- PS
- Units

Features:
- Duplicate previous BOQ
- Save templates
- Convert BOQ -> Quotation
- Convert BOQ -> Invoice
- Export PDF
- Export Excel
- Import Excel
- Mobile editing

4. QUOTATION & INVOICE MODULE
Features:
- Fully customizable template
- Company logo
- Signature
- VAT
- Terms & conditions
- Bank details
- Arabic + English support
- PDF generation
- WhatsApp share
- Payment status

5. EXPENSE MANAGEMENT
Features:
- Quick expense entry
- Expense categories
- Upload bill photos
- Attach project
- Daily expense tracking
- Expense analytics

Categories:
- Labor
- Material
- Transport
- Furniture
- Electrical
- Miscellaneous

6. MATERIAL MANAGEMENT
Features:
- Material purchase tracking
- Supplier tracking
- Material usage by project
- Stock tracking
- Low stock alerts

7. PAYMENT TRACKING
Features:
- Client payments
- Pending payments
- Supplier payments
- Advance payments
- Payment reminders

8. SITE PROGRESS TRACKING
Features:
- Upload photos/videos
- Progress notes
- Daily updates
- Timeline history

9. REPORTS
Generate:
- Project report
- Expense report
- Material report
- BOQ report
- Profit/loss report
- Invoice report

10. SETTINGS
- Company profile
- Logo upload
- Invoice customization
- Tax settings
- Language settings
- Backup settings

====================================================
DATABASE DESIGN
====================================================

Design scalable normalized PostgreSQL schema.

Main tables:
- users
- projects
- project_files
- boq_categories
- boq_items
- quotations
- quotation_items
- invoices
- invoice_items
- expenses
- materials
- suppliers
- payments
- reports
- settings

Use:
- UUID primary keys
- created_at
- updated_at
- soft delete support

====================================================
IMPORTANT BUSINESS LOGIC
====================================================

1. BOQ should automatically calculate totals.

2. Quotations should generate from BOQ.

3. Invoices should generate from quotation or manually.

4. Expenses should affect project profitability.

5. Dashboard should display:
- total income
- total expense
- net profit

6. Mobile experience is TOP PRIORITY.

====================================================
AUTHENTICATION
====================================================

Implement:
- Email login
- Phone login
- Session persistence

====================================================
OFFLINE SUPPORT
====================================================

The app should support:
- Viewing cached data offline
- Adding temporary offline entries
- Sync when internet returns

====================================================
FILE STORAGE
====================================================

Support:
- Images
- Videos
- PDFs
- Excel files

====================================================
MULTI-LANGUAGE
====================================================

Architecture should support:
- English
- Arabic

RTL support required.

====================================================
PDF SYSTEM
====================================================

Generate beautiful professional PDFs for:
- Quotations
- Invoices
- BOQs
- Reports

PDFs should:
- Be mobile-friendly
- Include logo
- Include signature
- Include bank details
- Have professional formatting

====================================================
SECURITY
====================================================

Implement:
- Supabase Row Level Security
- Secure APIs
- Validation
- Protected routes

====================================================
CODE QUALITY RULES
====================================================

- Use clean architecture
- Modular structure
- Reusable components
- Strong typing
- Proper folder organization
- Scalable patterns
- Avoid code duplication

====================================================
DEVELOPMENT PROCESS
====================================================

DO NOT immediately generate all code.

FIRST:
1. Analyze requirements
2. Create folder structure
3. Create technical architecture
4. Create database schema
5. Create page hierarchy
6. Create API structure
7. Create UI wireframes
8. Create implementation roadmap

THEN:
Build the app phase by phase.

====================================================
PHASES
====================================================

PHASE 1
- Authentication
- Dashboard
- Project management

PHASE 2
- BOQ system
- Quotation system
- Invoice system

PHASE 3
- Expenses
- Materials
- Payments

PHASE 4
- Reports
- Analytics
- Offline support

====================================================
EXPECTED OUTPUT
====================================================

For every phase:
- Explain architecture decisions
- Generate production-ready code
- Generate clean UI
- Add comments
- Add validation
- Add responsive behavior

Always prioritize:
1. simplicity
2. mobile usability
3. clean UX
4. speed
5. maintainability

====================================================
IMPORTANT UX RULE
====================================================

This app is for a non-technical business owner.

EVERYTHING must be:
- obvious
- simple
- visual
- touch-friendly
- fast

Avoid ERP complexity completely.

====================================================
START NOW
====================================================

First generate:
1. complete product architecture
2. database schema
3. folder structure
4. user flow diagrams
5. UI/UX structure
6. implementation roadmap

Only after approval begin coding.