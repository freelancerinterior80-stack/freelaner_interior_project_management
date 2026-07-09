import { isSupabaseConfigured } from "@/lib/supabase/config";
import { requireUser } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { assertNoQueryError } from "@/lib/supabase/query-error";
import { demoPayments } from "@/features/payments/demo-data";
import type { Payment } from "@/features/payments/types";

type PaymentRow = {
  id: string;
  project_id: string | null;
  supplier_id: string | null;
  invoice_id: string | null;
  direction: Payment["direction"];
  status: Payment["status"];
  amount: number | string;
  payment_date: string;
  method: string | null;
  reference: string | null;
  notes: string | null;
  reminder_at: string | null;
  projects: { name: string; clients: { name: string } | { name: string }[] | null } | null;
  suppliers: { name: string } | null;
  invoices: { invoice_number: string } | null;
};

export async function getPayments(): Promise<Payment[]> {
  if (!isSupabaseConfigured()) {
    return demoPayments;
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("payments")
    .select("id,project_id,supplier_id,invoice_id,direction,status,amount,payment_date,method,reference,notes,reminder_at,projects(name,clients(name)),suppliers(name),invoices(invoice_number)")
    .eq("owner_id", user.id)
    .is("deleted_at", null)
    .order("payment_date", { ascending: false });

  assertNoQueryError(error, "payments");

  return ((data ?? []) as unknown as PaymentRow[]).map((row) => {
    const client = Array.isArray(row.projects?.clients)
      ? row.projects?.clients[0]
      : row.projects?.clients;
    return {
      id: row.id,
      projectId: row.project_id,
      projectName: row.projects?.name,
      clientName: client?.name,
      supplierId: row.supplier_id,
      supplierName: row.suppliers?.name,
      invoiceId: row.invoice_id,
      invoiceNumber: row.invoices?.invoice_number,
      direction: row.direction,
      status: row.status,
      amount: Number(row.amount),
      paymentDate: row.payment_date,
      method: row.method,
      reference: row.reference,
      notes: row.notes,
      reminderAt: row.reminder_at
    };
  });
}
