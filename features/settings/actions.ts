"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
};

export async function saveSettings(_: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
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
    redirect("/settings");
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  let logoPath: string | null = null;
  let signaturePath: string | null = null;

  try {
    logoPath = await uploadOptionalFile(formData.get("logo"), user.id, "logo");
    signaturePath = await uploadOptionalFile(formData.get("signature"), user.id, "signature");
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not upload file." };
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

  if (settingsError || profileError) {
    return { ok: false, error: settingsError?.message ?? profileError?.message ?? "Could not save settings." };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/quotations");
  revalidatePath("/invoices");
  redirect("/settings");
}

async function uploadOptionalFile(file: FormDataEntryValue | null, userId: string, kind: "logo" | "signature") {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const path = `${userId}/settings/${kind}-${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from("project-files").upload(path, file, {
    contentType: file.type,
    upsert: false
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}
