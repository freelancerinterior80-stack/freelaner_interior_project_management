ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS company_website text,
  ADD COLUMN IF NOT EXISTS company_instagram text,
  ADD COLUMN IF NOT EXISTS authorized_signer_name text,
  ADD COLUMN IF NOT EXISTS bank_account_number text;
