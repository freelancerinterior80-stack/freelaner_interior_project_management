"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const paymentSchema = z.object({
  direction: z.enum(["client_in", "supplier_out"]),
  status: z.enum(["pending", "completed", "failed", "cancelled"]),
  amount: z.coerce.number().min(0.01, "Amount is required."),
  projectId: z.string().optional(),
  invoiceId: z.string().optional(),
  supplierName: z.string().optional(),
  paymentDate: z.string().min(1, "Date is required."),
  method: z.string().optional(),
  reference: z.string().optional(),
  reminderAt: z.string().optional(),
  notes: z.string().optional()
});

export type PaymentActionState = {
  ok: boolean;
  error?: string;
};

export async function createPayment(_: PaymentActionState, formData: FormData): Promise<PaymentActionState> {
  const parsed = paymentSchema.safeParse({
    direction: formData.get("direction"),
    status: formData.get("status"),
    amount: formData.get("amount"),
    projectId: formData.get("projectId") || undefined,
    invoiceId: formData.get("invoiceId") || undefined,
    supplierName: formData.get("supplierName") || undefined,
    paymentDate: formData.get("paymentDate"),
    method: formData.get("method") || undefined,
    reference: formData.get("reference") || undefined,
    reminderAt: formData.get("reminderAt") || undefined,
    notes: formData.get("notes") || undefined
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check payment details." };
  }

  if (!isSupabaseConfigured()) {
    redirect("/payments");
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  let supplierId: string | null = null;

  if (parsed.data.direction === "supplier_out" && parsed.data.supplierName) {
    const { data: supplier, error: supplierError } = await supabase
      .from("suppliers")
      .insert({ owner_id: user.id, name: parsed.data.supplierName })
      .select("id")
      .single();

    if (supplierError || !supplier) {
      return { ok: false, error: supplierError?.message ?? "Could not save supplier." };
    }

    supplierId = supplier.id;
  }

  const { error } = await supabase.from("payments").insert({
    owner_id: user.id,
    project_id: parsed.data.projectId || null,
    invoice_id: parsed.data.invoiceId || null,
    supplier_id: supplierId,
    direction: parsed.data.direction,
    status: parsed.data.status,
    amount: parsed.data.amount,
    payment_date: parsed.data.paymentDate,
    method: parsed.data.method || null,
    reference: parsed.data.reference || null,
    reminder_at: parsed.data.reminderAt ? new Date(parsed.data.reminderAt).toISOString() : null,
    notes: parsed.data.notes || null
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/payments");
  revalidatePath("/invoices");
  revalidatePath("/projects");
  redirect("/payments");
}

export async function deletePayment(formData: FormData) {
  const paymentId = String(formData.get("id") ?? "");
  if (!paymentId || !isSupabaseConfigured()) {
    revalidatePath("/payments");
    redirect("/payments");
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  await supabase
    .from("payments")
    .delete()
    .eq("id", paymentId)
    .eq("owner_id", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/payments");
  revalidatePath("/invoices");
  revalidatePath("/projects");
  redirect("/payments");
}
