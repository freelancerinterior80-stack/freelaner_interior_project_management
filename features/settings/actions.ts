"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const settingsSchema = z.object({
  companyName: z.string().min(2, "Company name is required."),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email("Enter a valid email.").optional().or(z.literal("")),
  companyAddress: z.string().optional(),
  companyWebsite: z.string().optional(),
  companyInstagram: z.string().optional(),
  authorizedSignerName: z.string().optional(),
  vatNumber: z.string().optional(),
  vatRate: z.coerce.number().min(0).max(1, "VAT rate must be 0 to 1."),
  bankName: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIban: z.string().optional(),
  bankSwift: z.string().optional(),
  defaultTermsEn: z.string().optional(),
  defaultTermsAr: z.string().optional(),
  invoicePrefix: z.string().min(2, "Invoice prefix is required.").max(8),
  quotationPrefix: z.string().min(2, "Quotation prefix is required.").max(8),
  currency: z.string().min(3).max(3),
  preferredLanguage: z.enum(["en", "ar"])
});

export type SettingsActionState = {
  ok: boolean;
  error?: string;
  warning?: string;
};

export async function saveSettings(_: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  try {
    return await doSaveSettings(formData);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "An unexpected error occurred. Please try again." };
  }
}

async function doSaveSettings(formData: FormData): Promise<SettingsActionState> {
  const parsed = settingsSchema.safeParse({
    companyName: formData.get("companyName"),
    companyPhone: formData.get("companyPhone") || undefined,
    companyEmail: formData.get("companyEmail") || "",
    companyAddress: formData.get("companyAddress") || undefined,
    companyWebsite: formData.get("companyWebsite") || undefined,
    companyInstagram: formData.get("companyInstagram") || undefined,
    authorizedSignerName: formData.get("authorizedSignerName") || undefined,
    vatNumber: formData.get("vatNumber") || undefined,
    vatRate: formData.get("vatRate"),
    bankName: formData.get("bankName") || undefined,
    bankAccountName: formData.get("bankAccountName") || undefined,
    bankAccountNumber: formData.get("bankAccountNumber") || undefined,
    bankIban: formData.get("bankIban") || undefined,
    bankSwift: formData.get("bankSwift") || undefined,
    defaultTermsEn: formData.get("defaultTermsEn") || undefined,
    defaultTermsAr: formData.get("defaultTermsAr") || undefined,
    invoicePrefix: formData.get("invoicePrefix"),
    quotationPrefix: formData.get("quotationPrefix"),
    currency: formData.get("currency"),
    preferredLanguage: formData.get("preferredLanguage")
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check settings details." };
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database not configured. Add Supabase environment variables to save settings." };
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  // Upload files — failures are non-fatal (settings save continues without them)
  let logoPath: string | null = null;
  let signaturePath: string | null = null;
  let uploadWarning: string | undefined;

  const logoResult = await uploadOptionalFile(formData.get("logo"), user.id, "logo");
  const signatureResult = await uploadOptionalFile(formData.get("signature"), user.id, "signature");

  if (logoResult.path) logoPath = logoResult.path;
  if (signatureResult.path) signaturePath = signatureResult.path;

  if (logoResult.error || signatureResult.error) {
    const fileErrors = [logoResult.error, signatureResult.error].filter(Boolean).join(" | ");
    uploadWarning = `Settings saved but file upload failed: ${fileErrors}. Create the "project-files" storage bucket in Supabase first.`;
  }

  const payload = {
    owner_id: user.id,
    company_name: parsed.data.companyName,
    company_phone: parsed.data.companyPhone || null,
    company_email: parsed.data.companyEmail || null,
    company_address: parsed.data.companyAddress || null,
    company_website: parsed.data.companyWebsite || null,
    company_instagram: parsed.data.companyInstagram || null,
    authorized_signer_name: parsed.data.authorizedSignerName || null,
    vat_number: parsed.data.vatNumber || null,
    vat_rate: parsed.data.vatRate,
    bank_name: parsed.data.bankName || null,
    bank_account_name: parsed.data.bankAccountName || null,
    bank_account_number: parsed.data.bankAccountNumber || null,
    bank_iban: parsed.data.bankIban || null,
    bank_swift: parsed.data.bankSwift || null,
    default_terms_en: parsed.data.defaultTermsEn || null,
    default_terms_ar: parsed.data.defaultTermsAr || null,
    invoice_prefix: parsed.data.invoicePrefix.toUpperCase(),
    quotation_prefix: parsed.data.quotationPrefix.toUpperCase(),
    currency: parsed.data.currency.toUpperCase(),
    ...(logoPath ? { logo_path: logoPath } : {}),
    ...(signaturePath ? { signature_path: signaturePath } : {})
  };

  const [{ error: settingsError }, { error: profileError }] = await Promise.all([
    supabase.from("settings").upsert(payload, { onConflict: "owner_id" }),
    supabase.from("profiles").update({ preferred_language: parsed.data.preferredLanguage }).eq("id", user.id)
  ]);

  if (settingsError) {
    // Detect the common case: migration not run yet
    const hint = settingsError.message.includes("column")
      ? " (Run the SQL migration in Supabase first.)"
      : "";
    return { ok: false, error: settingsError.message + hint };
  }

  if (profileError) {
    return { ok: false, error: profileError.message };
  }

  // If there was a file upload warning, return it instead of redirecting so user can see it
  if (uploadWarning) {
    revalidatePath("/settings");
    return { ok: true, warning: uploadWarning };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/quotations");
  revalidatePath("/invoices");
  return { ok: true };
}

async function uploadOptionalFile(
  file: FormDataEntryValue | null,
  userId: string,
  kind: "logo" | "signature"
): Promise<{ path: string | null; error: string | null }> {
  if (!(file instanceof File) || file.size === 0) {
    return { path: null, error: null };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const path = `${userId}/settings/${kind}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("project-files").upload(path, file, {
      contentType: file.type,
      upsert: false
    });

    if (error) {
      return { path: null, error: error.message };
    }

    return { path, error: null };
  } catch (err) {
    return { path: null, error: err instanceof Error ? err.message : "Upload failed" };
  }
}
