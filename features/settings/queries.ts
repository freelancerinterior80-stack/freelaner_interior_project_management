import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/auth/guards";
import { isSupabaseConfigured, supabaseUrl, supabaseServiceRoleKey } from "@/lib/supabase/config";
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

const SIGNED_URL_TTL = 60 * 60 * 24; // 24 hours — reduces Storage API calls vs 1 hour
const SETTINGS_CACHE_TTL = 60 * 60;  // 1 hour — re-fetch from DB at most once per hour

// Cached inner fetch using admin client (no cookies — safe for unstable_cache).
// Invalidated immediately when settings are saved via revalidateTag("app-settings").
const fetchSettingsByOwnerId = unstable_cache(
  async (ownerId: string): Promise<AppSettings> => {
    const admin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const [{ data: settings }, { data: profile }] = await Promise.all([
      admin
        .from("settings")
        .select(
          "company_name,company_phone,company_email,company_address,company_website,company_instagram,authorized_signer_name,logo_path,signature_path,vat_number,vat_rate,bank_name,bank_account_name,bank_account_number,bank_iban,bank_swift,default_terms_en,default_terms_ar,invoice_prefix,quotation_prefix,currency"
        )
        .eq("owner_id", ownerId)
        .is("deleted_at", null)
        .maybeSingle(),
      admin.from("profiles").select("preferred_language").eq("id", ownerId).maybeSingle()
    ]);

    const lang: "en" | "ar" = profile?.preferred_language === "ar" ? "ar" : "en";

    if (!settings) {
      return { ...demoSettings, companyName: "", companyPhone: null, companyEmail: null, preferredLanguage: lang };
    }

    const row = settings as SettingsRow;
    const [logoUrl, signatureUrl] = await Promise.all([
      row.logo_path ? getAdminSignedUrl(admin, row.logo_path) : Promise.resolve(null),
      row.signature_path ? getAdminSignedUrl(admin, row.signature_path) : Promise.resolve(null)
    ]);

    return {
      companyName: row.company_name,
      companyPhone: row.company_phone,
      companyEmail: row.company_email,
      companyAddress: row.company_address,
      companyWebsite: row.company_website,
      companyInstagram: row.company_instagram,
      authorizedSignerName: row.authorized_signer_name,
      logoPath: row.logo_path,
      logoUrl,
      signaturePath: row.signature_path,
      signatureUrl,
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
      preferredLanguage: lang
    };
  },
  ["app-settings"],
  { revalidate: SETTINGS_CACHE_TTL, tags: ["app-settings"] }
);

// Fallback for when service role key is unavailable (uses cookie-based client, no cross-request cache).
async function fetchSettingsFallback(userId: string, userEmail: string | null | undefined): Promise<AppSettings> {
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();

  const [{ data: settings }, { data: profile }] = await Promise.all([
    supabase
      .from("settings")
      .select(
        "company_name,company_phone,company_email,company_address,company_website,company_instagram,authorized_signer_name,logo_path,signature_path,vat_number,vat_rate,bank_name,bank_account_name,bank_account_number,bank_iban,bank_swift,default_terms_en,default_terms_ar,invoice_prefix,quotation_prefix,currency"
      )
      .eq("owner_id", userId)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase.from("profiles").select("preferred_language").eq("id", userId).maybeSingle()
  ]);

  const lang: "en" | "ar" = profile?.preferred_language === "ar" ? "ar" : "en";
  if (!settings) {
    return { ...demoSettings, companyName: "", companyPhone: null, companyEmail: userEmail ?? null, preferredLanguage: lang };
  }

  const row = settings as SettingsRow;
  const [logoUrl, signatureUrl] = await Promise.all([
    row.logo_path ? getServerSignedUrl(row.logo_path) : Promise.resolve(null),
    row.signature_path ? getServerSignedUrl(row.signature_path) : Promise.resolve(null)
  ]);

  return {
    companyName: row.company_name,
    companyPhone: row.company_phone,
    companyEmail: row.company_email,
    companyAddress: row.company_address,
    companyWebsite: row.company_website,
    companyInstagram: row.company_instagram,
    authorizedSignerName: row.authorized_signer_name,
    logoPath: row.logo_path,
    logoUrl,
    signaturePath: row.signature_path,
    signatureUrl,
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
    preferredLanguage: lang
  };
}

// Public API:
// - React cache() deduplicates calls within the same request (no extra DB queries when
//   multiple Server Components on the same page all call getSettings()).
// - unstable_cache caches the result across requests for up to 1 hour.
// - revalidateTag("app-settings") in saveSettings() clears the cache immediately on save.
export const getSettings = cache(async (): Promise<AppSettings> => {
  if (!isSupabaseConfigured()) return demoSettings;
  const user = await requireUser();

  if (supabaseServiceRoleKey) {
    return fetchSettingsByOwnerId(user.id);
  }

  return fetchSettingsFallback(user.id, user.email);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getAdminSignedUrl(admin: SupabaseClient<any>, path: string): Promise<string | null> {
  const { data } = await admin.storage.from("project-files").createSignedUrl(path, SIGNED_URL_TTL);
  return data?.signedUrl ?? null;
}

async function getServerSignedUrl(path: string): Promise<string | null> {
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.storage.from("project-files").createSignedUrl(path, SIGNED_URL_TTL);
  return data?.signedUrl ?? null;
}
