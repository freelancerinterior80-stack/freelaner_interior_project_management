import { requireUser } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { demoSettings } from "@/features/settings/demo-data";
import type { AppSettings } from "@/features/settings/types";

type SettingsRow = {
  company_name: string;
  company_phone: string | null;
  company_email: string | null;
  company_address: string | null;
  company_website: string | null;
  company_instagram: string | null;
  authorized_signer_name: string | null;
  logo_path: string | null;
  signature_path: string | null;
  vat_number: string | null;
  vat_rate: number | string;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_iban: string | null;
  bank_swift: string | null;
  default_terms_en: string | null;
  default_terms_ar: string | null;
  invoice_prefix: string;
  quotation_prefix: string;
  currency: string;
};

export async function getSettings(): Promise<AppSettings> {
  if (!isSupabaseConfigured()) {
    return demoSettings;
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const [{ data: settings }, { data: profile }] = await Promise.all([
    supabase
      .from("settings")
      .select(
        "company_name,company_phone,company_email,company_address,company_website,company_instagram,authorized_signer_name,logo_path,signature_path,vat_number,vat_rate,bank_name,bank_account_name,bank_account_number,bank_iban,bank_swift,default_terms_en,default_terms_ar,invoice_prefix,quotation_prefix,currency"
      )
      .eq("owner_id", user.id)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase.from("profiles").select("preferred_language").eq("id", user.id).maybeSingle()
  ]);

  if (!settings) {
    return {
      ...demoSettings,
      companyName: "",
      companyPhone: null,
      companyEmail: user.email ?? null,
      preferredLanguage: profile?.preferred_language === "ar" ? "ar" : "en"
    };
  }

  return mapSettings(settings as SettingsRow, profile?.preferred_language === "ar" ? "ar" : "en");
}

async function mapSettings(row: SettingsRow, preferredLanguage: "en" | "ar"): Promise<AppSettings> {
  return {
    companyName: row.company_name,
    companyPhone: row.company_phone,
    companyEmail: row.company_email,
    companyAddress: row.company_address,
    companyWebsite: row.company_website,
    companyInstagram: row.company_instagram,
    authorizedSignerName: row.authorized_signer_name,
    logoPath: row.logo_path,
    logoUrl: row.logo_path ? await getSignedUrl(row.logo_path) : null,
    signaturePath: row.signature_path,
    signatureUrl: row.signature_path ? await getSignedUrl(row.signature_path) : null,
    vatNumber: row.vat_number,
    vatRate: Number(row.vat_rate),
    bankName: row.bank_name,
    bankAccountName: row.bank_account_name,
    bankAccountNumber: row.bank_account_number,
    bankIban: row.bank_iban,
    bankSwift: row.bank_swift,
    defaultTermsEn: row.default_terms_en,
    defaultTermsAr: row.default_terms_ar,
    invoicePrefix: row.invoice_prefix,
    quotationPrefix: row.quotation_prefix,
    currency: row.currency,
    preferredLanguage
  };
}

async function getSignedUrl(path: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.storage.from("project-files").createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}
