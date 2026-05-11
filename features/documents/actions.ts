"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDocumentTotal, getVatAmount } from "@/features/boq/calculations";
import { requireUser } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const idSchema = z.object({
  id: z.string().min(1)
});

export async function createQuotationFromBoq(formData: FormData) {
  const parsed = idSchema.parse({ id: formData.get("boqId") });

  if (!isSupabaseConfigured()) {
    redirect("/quotations/demo-qtn-001");
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const [{ data: boq }, { data: items }] = await Promise.all([
    supabase
      .from("boqs")
      .select("id,project_id,subtotal")
      .eq("owner_id", user.id)
      .eq("id", parsed.id)
      .single(),
    supabase
      .from("boq_items")
      .select("id,description,quantity,unit,unit_rate,total,sort_order")
      .eq("owner_id", user.id)
      .eq("boq_id", parsed.id)
      .is("deleted_at", null)
      .order("sort_order")
  ]);

  if (!boq) {
    redirect(`/boq/${parsed.id}`);
  }

  const subtotal = Number(boq.subtotal ?? 0);
  const vatRate = 0;
  const { data: quotation } = await supabase
    .from("quotations")
    .insert({
      owner_id: user.id,
      project_id: boq.project_id,
      boq_id: boq.id,
      quotation_number: `QTN-${Date.now().toString().slice(-6)}`,
      status: "draft",
      subtotal,
      vat_rate: vatRate,
      vat_amount: getVatAmount(subtotal, vatRate),
      total: getDocumentTotal(subtotal, vatRate),
      terms_en: "Payment as agreed. Materials subject to market availability.",
      terms_ar: "الدفع حسب الاتفاق. المواد حسب توفر السوق."
    })
    .select("id")
    .single();

  if (!quotation) {
    redirect(`/boq/${parsed.id}`);
  }

  if (items?.length) {
    await supabase.from("quotation_items").insert(
      items.map((item) => ({
        owner_id: user.id,
        quotation_id: quotation.id,
        source_boq_item_id: item.id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_rate: item.unit_rate,
        sort_order: item.sort_order
      }))
    );
  }

  revalidatePath("/quotations");
  redirect(`/quotations/${quotation.id}`);
}

const createInvoiceSchema = z.object({
  quotationId: z.string().min(1),
  issueDate: z.string().min(1, "Issue date is required."),
  dueDate: z.string().optional(),
  discountAmount: z.coerce.number().min(0).default(0),
  vatRate: z.coerce.number().min(0).max(1).default(0),
  depositAmount: z.coerce.number().min(0).default(0)
});

export type CreateInvoiceState = { ok: boolean; error?: string };

export async function createInvoiceFromQuotation(
  _: CreateInvoiceState,
  formData: FormData
): Promise<CreateInvoiceState> {
  const parsed = createInvoiceSchema.safeParse({
    quotationId: formData.get("quotationId"),
    issueDate: formData.get("issueDate"),
    dueDate: formData.get("dueDate") || undefined,
    discountAmount: formData.get("discountAmount") || 0,
    vatRate: formData.get("vatRate") || 0,
    depositAmount: formData.get("depositAmount") || 0
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check invoice details." };
  }

  if (!isSupabaseConfigured()) {
    redirect("/invoices/demo-inv-001");
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const [{ data: quotation }, { data: items }] = await Promise.all([
    supabase
      .from("quotations")
      .select("id,project_id,client_id,subtotal,terms_en,terms_ar")
      .eq("owner_id", user.id)
      .eq("id", parsed.data.quotationId)
      .single(),
    supabase
      .from("quotation_items")
      .select("id,description,quantity,unit,unit_rate,total,sort_order")
      .eq("owner_id", user.id)
      .eq("quotation_id", parsed.data.quotationId)
      .is("deleted_at", null)
      .order("sort_order")
  ]);

  if (!quotation) {
    return { ok: false, error: "Quotation not found." };
  }

  const subtotal = Number(quotation.subtotal);
  const discountAmount = Math.min(parsed.data.discountAmount, subtotal);
  const vatRate = parsed.data.vatRate;
  const vatAmount = getVatAmount(subtotal - discountAmount, vatRate);
  const total = getDocumentTotal(subtotal, vatRate, discountAmount);
  const depositAmount = Math.min(parsed.data.depositAmount, total);

  const { data: invoice } = await supabase
    .from("invoices")
    .insert({
      owner_id: user.id,
      project_id: quotation.project_id,
      client_id: quotation.client_id,
      quotation_id: quotation.id,
      invoice_number: `INV-${Date.now().toString().slice(-6)}`,
      status: "draft",
      issue_date: parsed.data.issueDate,
      due_date: parsed.data.dueDate || null,
      subtotal,
      discount_amount: discountAmount,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      total,
      deposit_amount: depositAmount,
      terms_en: quotation.terms_en,
      terms_ar: quotation.terms_ar
    })
    .select("id")
    .single();

  if (!invoice) {
    return { ok: false, error: "Failed to create invoice." };
  }

  if (items?.length) {
    await supabase.from("invoice_items").insert(
      items.map((item) => ({
        owner_id: user.id,
        invoice_id: invoice.id,
        source_quotation_item_id: item.id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_rate: item.unit_rate,
        sort_order: item.sort_order
      }))
    );
  }

  revalidatePath("/invoices");
  redirect(`/invoices/${invoice.id}`);
}
