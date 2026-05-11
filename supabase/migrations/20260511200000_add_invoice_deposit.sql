-- Add deposit_amount to invoices: the advance/deposit the client must pay upfront.
-- display-only; does not affect paid_amount or balance_due (those come from the payments trigger).
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS deposit_amount numeric(14,2) not null default 0;
