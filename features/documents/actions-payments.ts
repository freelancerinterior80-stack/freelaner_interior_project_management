"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.coerce.number().positive("Amount must be greater than 0."),
  method: z.string().optional(),
  reference: z.string().optional(),
  paymentDate: z.string().min(1, "Date is required.")
});

export type RecordPaymentState = { ok: boolean; error?: string };

export async function recordInvoicePayment(
  _: RecordPaymentState,
  formData: FormData
): Promise<RecordPaymentState> {
  const parsed = recordPaymentSchema.safeParse({
    invoiceId: formData.get("invoiceId"),
    amount: formData.get("amount"),
    method: formData.get("method") || undefined,
    reference: formData.get("reference") || undefined,
    paymentDate: formData.get("paymentDate")
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check payment details." };
  }

  if (!isSupabaseConfigured()) {
    return { ok: true };
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  // Fetch current invoice total so we can determine the new status
  const { data: invoice, error: fetchError } = await supabase
    .from("invoices")
    .select("total, paid_amount, status")
    .eq("id", parsed.data.invoiceId)
    .eq("owner_id", user.id)
    .single();

  if (fetchError || !invoice) {
    return { ok: false, error: "Invoice not found." };
  }

  // Insert the payment — DB trigger auto-updates invoices.paid_amount and balance_due
  const { error: paymentError } = await supabase.from("payments").insert({
    owner_id: user.id,
    invoice_id: parsed.data.invoiceId,
    direction: "client_in",
    status: "completed",
    amount: parsed.data.amount,
    payment_date: parsed.data.paymentDate,
    method: parsed.data.method || null,
    reference: parsed.data.reference || null
  });

  if (paymentError) {
    return { ok: false, error: paymentError.message };
  }

  // Determine new invoice status based on cumulative paid amount after this payment
  const newPaidAmount = Number(invoice.paid_amount) + parsed.data.amount;
  const total = Number(invoice.total);
  const newStatus = newPaidAmount >= total ? "paid" : "part_paid";

  // Only update status if it's not already cancelled
  if (!["cancelled"].includes(invoice.status)) {
    await supabase
      .from("invoices")
      .update({ status: newStatus })
      .eq("id", parsed.data.invoiceId)
      .eq("owner_id", user.id);
  }

  revalidatePath(`/invoices/${parsed.data.invoiceId}`);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  revalidatePath("/payments");

  return { ok: true };
}
