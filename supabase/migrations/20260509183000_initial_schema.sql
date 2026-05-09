-- Phase 0 Supabase/PostgreSQL schema draft.
-- This is intended as the baseline for Supabase migrations after architecture approval.

create extension if not exists "pgcrypto";

create type project_status as enum (
  'lead',
  'active',
  'on_hold',
  'completed',
  'cancelled'
);

create type project_type as enum (
  'construction',
  'interior_design',
  'fit_out',
  'furniture',
  'renovation',
  'contracting',
  'other'
);

create type file_kind as enum (
  'image',
  'video',
  'pdf',
  'excel',
  'document',
  'other'
);

create type boq_unit as enum (
  'm2',
  'ls',
  'mtr',
  'ps',
  'units'
);

create type document_status as enum (
  'draft',
  'issued',
  'sent',
  'accepted',
  'rejected',
  'cancelled'
);

create type invoice_status as enum (
  'draft',
  'issued',
  'sent',
  'part_paid',
  'paid',
  'overdue',
  'cancelled'
);

create type expense_category as enum (
  'labor',
  'material',
  'transport',
  'furniture',
  'electrical',
  'miscellaneous'
);

create type payment_direction as enum (
  'client_in',
  'supplier_out'
);

create type payment_status as enum (
  'pending',
  'completed',
  'failed',
  'cancelled'
);

create type material_movement_type as enum (
  'purchase',
  'usage',
  'adjustment'
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'ar')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table settings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  company_name text not null default '',
  company_phone text,
  company_email text,
  company_address text,
  logo_path text,
  signature_path text,
  vat_number text,
  vat_rate numeric(7,4) not null default 0,
  bank_name text,
  bank_account_name text,
  bank_iban text,
  bank_swift text,
  default_terms_en text,
  default_terms_ar text,
  invoice_prefix text not null default 'INV',
  quotation_prefix text not null default 'QTN',
  currency text not null default 'KWD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (owner_id)
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  name text not null,
  site_location text,
  type project_type not null default 'other',
  status project_status not null default 'lead',
  budget numeric(14,2) not null default 0 check (budget >= 0),
  start_date date,
  end_date date,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table project_files (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  kind file_kind not null default 'other',
  storage_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  caption text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table progress_updates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  progress_percent integer check (progress_percent between 0 and 100),
  note text,
  update_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table progress_files (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  progress_update_id uuid not null references progress_updates(id) on delete cascade,
  kind file_kind not null default 'image',
  storage_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table boqs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  is_template boolean not null default false,
  source_boq_id uuid references boqs(id) on delete set null,
  notes text,
  subtotal numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table boq_categories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  boq_id uuid not null references boqs(id) on delete cascade,
  parent_id uuid references boq_categories(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table boq_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  boq_id uuid not null references boqs(id) on delete cascade,
  category_id uuid references boq_categories(id) on delete set null,
  description text not null,
  quantity numeric(14,3) not null default 1 check (quantity >= 0),
  unit boq_unit not null default 'units',
  unit_rate numeric(14,2) not null default 0 check (unit_rate >= 0),
  total numeric(14,2) generated always as (round((quantity * unit_rate)::numeric, 2)) stored,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table quotations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  boq_id uuid references boqs(id) on delete set null,
  quotation_number text not null,
  status document_status not null default 'draft',
  issue_date date not null default current_date,
  valid_until date,
  subtotal numeric(14,2) not null default 0,
  discount_amount numeric(14,2) not null default 0 check (discount_amount >= 0),
  vat_rate numeric(7,4) not null default 0,
  vat_amount numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  terms_en text,
  terms_ar text,
  notes text,
  pdf_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (owner_id, quotation_number)
);

create table quotation_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  quotation_id uuid not null references quotations(id) on delete cascade,
  source_boq_item_id uuid references boq_items(id) on delete set null,
  description text not null,
  quantity numeric(14,3) not null default 1 check (quantity >= 0),
  unit boq_unit not null default 'units',
  unit_rate numeric(14,2) not null default 0 check (unit_rate >= 0),
  total numeric(14,2) generated always as (round((quantity * unit_rate)::numeric, 2)) stored,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  quotation_id uuid references quotations(id) on delete set null,
  invoice_number text not null,
  status invoice_status not null default 'draft',
  issue_date date not null default current_date,
  due_date date,
  subtotal numeric(14,2) not null default 0,
  discount_amount numeric(14,2) not null default 0 check (discount_amount >= 0),
  vat_rate numeric(7,4) not null default 0,
  vat_amount numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  paid_amount numeric(14,2) not null default 0,
  balance_due numeric(14,2) generated always as (round((total - paid_amount)::numeric, 2)) stored,
  terms_en text,
  terms_ar text,
  notes text,
  pdf_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (owner_id, invoice_number)
);

create table invoice_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  invoice_id uuid not null references invoices(id) on delete cascade,
  source_quotation_item_id uuid references quotation_items(id) on delete set null,
  description text not null,
  quantity numeric(14,3) not null default 1 check (quantity >= 0),
  unit boq_unit not null default 'units',
  unit_rate numeric(14,2) not null default 0 check (unit_rate >= 0),
  total numeric(14,2) generated always as (round((quantity * unit_rate)::numeric, 2)) stored,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  supplier_id uuid references suppliers(id) on delete set null,
  category expense_category not null default 'miscellaneous',
  amount numeric(14,2) not null check (amount >= 0),
  expense_date date not null default current_date,
  description text,
  bill_file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table materials (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  supplier_id uuid references suppliers(id) on delete set null,
  name text not null,
  unit boq_unit not null default 'units',
  current_stock numeric(14,3) not null default 0,
  low_stock_threshold numeric(14,3) not null default 0,
  unit_cost numeric(14,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table material_movements (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  material_id uuid not null references materials(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  supplier_id uuid references suppliers(id) on delete set null,
  movement_type material_movement_type not null,
  quantity numeric(14,3) not null check (quantity >= 0),
  unit_cost numeric(14,2) not null default 0,
  movement_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  supplier_id uuid references suppliers(id) on delete set null,
  invoice_id uuid references invoices(id) on delete set null,
  direction payment_direction not null,
  status payment_status not null default 'completed',
  amount numeric(14,2) not null check (amount >= 0),
  payment_date date not null default current_date,
  method text,
  reference text,
  notes text,
  reminder_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  report_type text not null,
  title text not null,
  filters jsonb not null default '{}'::jsonb,
  storage_path text,
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table offline_sync_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  client_temp_id text not null,
  entity_type text not null,
  entity_id uuid,
  operation text not null check (operation in ('insert', 'update', 'delete')),
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'synced', 'failed', 'conflict')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, client_temp_id)
);

create index clients_owner_idx on clients(owner_id) where deleted_at is null;
create index suppliers_owner_idx on suppliers(owner_id) where deleted_at is null;
create index projects_owner_status_idx on projects(owner_id, status) where deleted_at is null;
create index project_files_project_idx on project_files(project_id) where deleted_at is null;
create index progress_updates_project_date_idx on progress_updates(project_id, update_date desc) where deleted_at is null;
create index boqs_project_idx on boqs(project_id) where deleted_at is null;
create index boq_categories_boq_idx on boq_categories(boq_id, sort_order) where deleted_at is null;
create index boq_items_boq_idx on boq_items(boq_id, sort_order) where deleted_at is null;
create index quotations_owner_status_idx on quotations(owner_id, status) where deleted_at is null;
create index invoices_owner_status_idx on invoices(owner_id, status) where deleted_at is null;
create index expenses_project_date_idx on expenses(project_id, expense_date desc) where deleted_at is null;
create index materials_owner_stock_idx on materials(owner_id, current_stock, low_stock_threshold) where deleted_at is null;
create index material_movements_material_idx on material_movements(material_id, movement_date desc) where deleted_at is null;
create index payments_project_date_idx on payments(project_id, payment_date desc) where deleted_at is null;
create index reports_owner_type_idx on reports(owner_id, report_type) where deleted_at is null;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function refresh_boq_subtotal(target_boq_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update boqs
  set subtotal = coalesce((
    select sum(total)
    from boq_items
    where boq_id = target_boq_id
      and deleted_at is null
  ), 0),
  updated_at = now()
  where id = target_boq_id;
end;
$$;

create or replace function refresh_boq_subtotal_trigger()
returns trigger
language plpgsql
as $$
begin
  perform refresh_boq_subtotal(coalesce(new.boq_id, old.boq_id));
  return coalesce(new, old);
end;
$$;

create or replace function refresh_invoice_paid_amount(target_invoice_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update invoices
  set paid_amount = coalesce((
    select sum(amount)
    from payments
    where invoice_id = target_invoice_id
      and direction = 'client_in'
      and status = 'completed'
      and deleted_at is null
  ), 0),
  updated_at = now()
  where id = target_invoice_id;
end;
$$;

create or replace function refresh_invoice_paid_amount_trigger()
returns trigger
language plpgsql
as $$
begin
  if coalesce(new.invoice_id, old.invoice_id) is not null then
    perform refresh_invoice_paid_amount(coalesce(new.invoice_id, old.invoice_id));
  end if;
  return coalesce(new, old);
end;
$$;

create or replace function adjust_material_stock(target_material_id uuid, delta_quantity numeric)
returns void
language plpgsql
security definer
as $$
begin
  update materials
  set current_stock = greatest(0, current_stock + delta_quantity),
      updated_at = now()
  where id = target_material_id;
end;
$$;

create trigger profiles_set_updated_at before update on profiles for each row execute function set_updated_at();
create trigger settings_set_updated_at before update on settings for each row execute function set_updated_at();
create trigger clients_set_updated_at before update on clients for each row execute function set_updated_at();
create trigger suppliers_set_updated_at before update on suppliers for each row execute function set_updated_at();
create trigger projects_set_updated_at before update on projects for each row execute function set_updated_at();
create trigger project_files_set_updated_at before update on project_files for each row execute function set_updated_at();
create trigger progress_updates_set_updated_at before update on progress_updates for each row execute function set_updated_at();
create trigger progress_files_set_updated_at before update on progress_files for each row execute function set_updated_at();
create trigger boqs_set_updated_at before update on boqs for each row execute function set_updated_at();
create trigger boq_categories_set_updated_at before update on boq_categories for each row execute function set_updated_at();
create trigger boq_items_set_updated_at before update on boq_items for each row execute function set_updated_at();
create trigger quotations_set_updated_at before update on quotations for each row execute function set_updated_at();
create trigger quotation_items_set_updated_at before update on quotation_items for each row execute function set_updated_at();
create trigger invoices_set_updated_at before update on invoices for each row execute function set_updated_at();
create trigger invoice_items_set_updated_at before update on invoice_items for each row execute function set_updated_at();
create trigger expenses_set_updated_at before update on expenses for each row execute function set_updated_at();
create trigger materials_set_updated_at before update on materials for each row execute function set_updated_at();
create trigger material_movements_set_updated_at before update on material_movements for each row execute function set_updated_at();
create trigger payments_set_updated_at before update on payments for each row execute function set_updated_at();
create trigger reports_set_updated_at before update on reports for each row execute function set_updated_at();
create trigger offline_sync_entries_set_updated_at before update on offline_sync_entries for each row execute function set_updated_at();

create trigger boq_items_refresh_subtotal
after insert or update or delete on boq_items
for each row execute function refresh_boq_subtotal_trigger();

create trigger payments_refresh_invoice_paid_amount
after insert or update or delete on payments
for each row execute function refresh_invoice_paid_amount_trigger();

create or replace view project_financial_summary as
select
  p.id as project_id,
  p.owner_id,
  coalesce(sum(pay.amount) filter (where pay.direction = 'client_in' and pay.status = 'completed' and pay.deleted_at is null), 0) as total_income,
  coalesce((select sum(e.amount) from expenses e where e.project_id = p.id and e.deleted_at is null), 0)
    + coalesce(sum(pay.amount) filter (where pay.direction = 'supplier_out' and pay.status = 'completed' and pay.deleted_at is null), 0) as total_expense,
  coalesce(sum(pay.amount) filter (where pay.direction = 'client_in' and pay.status = 'completed' and pay.deleted_at is null), 0)
    - coalesce((select sum(e.amount) from expenses e where e.project_id = p.id and e.deleted_at is null), 0)
    - coalesce(sum(pay.amount) filter (where pay.direction = 'supplier_out' and pay.status = 'completed' and pay.deleted_at is null), 0) as net_profit
from projects p
left join payments pay on pay.project_id = p.id
where p.deleted_at is null
group by p.id, p.owner_id;

alter table profiles enable row level security;
alter table settings enable row level security;
alter table clients enable row level security;
alter table suppliers enable row level security;
alter table projects enable row level security;
alter table project_files enable row level security;
alter table progress_updates enable row level security;
alter table progress_files enable row level security;
alter table boqs enable row level security;
alter table boq_categories enable row level security;
alter table boq_items enable row level security;
alter table quotations enable row level security;
alter table quotation_items enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table expenses enable row level security;
alter table materials enable row level security;
alter table material_movements enable row level security;
alter table payments enable row level security;
alter table reports enable row level security;
alter table offline_sync_entries enable row level security;

create policy "profiles owner access" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "settings owner access" on settings
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "clients owner access" on clients
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "suppliers owner access" on suppliers
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "projects owner access" on projects
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "project_files owner access" on project_files
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "progress_updates owner access" on progress_updates
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "progress_files owner access" on progress_files
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "boqs owner access" on boqs
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "boq_categories owner access" on boq_categories
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "boq_items owner access" on boq_items
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "quotations owner access" on quotations
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "quotation_items owner access" on quotation_items
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "invoices owner access" on invoices
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "invoice_items owner access" on invoice_items
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "expenses owner access" on expenses
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "materials owner access" on materials
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "material_movements owner access" on material_movements
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "payments owner access" on payments
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "reports owner access" on reports
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "offline_sync_entries owner access" on offline_sync_entries
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
