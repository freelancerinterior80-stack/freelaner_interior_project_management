import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import { demoInvoices, demoQuotations } from "@/features/documents/demo-data";
import type { DocumentItem, DocumentSummary, Invoice, Quotation } from "@/features/documents/types";

type QuotationRow = {
  id: string;
  quotation_number: string;
  project_id: string | null;
  boq_id: string | null;
  status: Quotation["status"];
  issue_date: string;
  valid_until: string | null;
  subtotal: number | string;
  discount_amount: number | string;
  vat_rate: number | string;
  vat_amount: number | string;
  total: number | string;
  terms_en: string | null;
  terms_ar: string | null;
  notes: string | null;
  projects: { name: string; clients: { name: string } | { name: string }[] | null } | null;
};

type InvoiceRow = {
  id: string;
  invoice_number: string;
  project_id: string | null;
  quotation_id: string | null;
  status: Invoice["status"];
  issue_date: string;
  due_date: string | null;
  subtotal: number | string;
  discount_amount: number | string;
  vat_rate: number | string;
  vat_amount: number | string;
  total: number | string;
  paid_amount: number | string;
  balance_due: number | string;
  deposit_amount: number | string;
  terms_en: string | null;
  terms_ar: string | null;
  notes: string | null;
  projects: { name: string; clients: { name: string } | { name: string }[] | null } | null;
};

type ItemRow = {
  id: string;
  description: string;
  quantity: number | string;
  unit: DocumentItem["unit"];
  unit_rate: number | string;
  total: number | string;
};

export async function getQuotationSummaries(): Promise<DocumentSummary[]> {
  if (!isSupabaseConfigured()) {
    return demoQuotations.map((quotation) => ({
      id: quotation.id,
      number: quotation.quotationNumber,
      projectName: quotation.projectName,
      clientName: quotation.clientName,
      status: quotation.status,
      total: quotation.total,
      date: quotation.issueDate
    }));
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("quotations")
    .select("id,quotation_number,status,issue_date,total,projects(name,clients(name))")
    .eq("owner_id", user.id)
    .is("deleted_at", null)
    .order("issue_date", { ascending: false });

  if (error || !data) {
    return [];
  }

  return ((data as unknown) as QuotationRow[]).map((row) => {
    const client = Array.isArray(row.projects?.clients)
      ? row.projects?.clients[0]
      : row.projects?.clients;
    return {
      id: row.id,
      number: row.quotation_number,
      projectName: row.projects?.name,
      clientName: client?.name,
      status: row.status,
      total: Number(row.total),
      date: row.issue_date
    };
  });
}

export async function getInvoiceSummaries(): Promise<DocumentSummary[]> {
  if (!isSupabaseConfigured()) {
    return demoInvoices.map((invoice) => ({
      id: invoice.id,
      number: invoice.invoiceNumber,
      projectName: invoice.projectName,
      clientName: invoice.clientName,
      status: invoice.status,
      total: invoice.total,
      date: invoice.issueDate
    }));
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("id,invoice_number,status,issue_date,total,projects(name,clients(name))")
    .eq("owner_id", user.id)
    .is("deleted_at", null)
    .order("issue_date", { ascending: false });

  if (error || !data) {
    return [];
  }

  return ((data as unknown) as InvoiceRow[]).map((row) => {
    const client = Array.isArray(row.projects?.clients)
      ? row.projects?.clients[0]
      : row.projects?.clients;
    return {
      id: row.id,
      number: row.invoice_number,
      projectName: row.projects?.name,
      clientName: client?.name,
      status: row.status,
      total: Number(row.total),
      date: row.issue_date
    };
  });
}

export async function getQuotationById(id: string): Promise<Quotation | null> {
  if (!isSupabaseConfigured()) {
    return demoQuotations.find((quotation) => quotation.id === id) ?? null;
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const [{ data: quotation }, { data: items }] = await Promise.all([
    supabase
      .from("quotations")
      .select(
        "id,quotation_number,project_id,boq_id,status,issue_date,valid_until,subtotal,discount_amount,vat_rate,vat_amount,total,terms_en,terms_ar,notes,projects(name,clients(name))"
      )
      .eq("owner_id", user.id)
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("quotation_items")
      .select("id,description,quantity,unit,unit_rate,total")
      .eq("owner_id", user.id)
      .eq("quotation_id", id)
      .is("deleted_at", null)
      .order("sort_order")
  ]);

  if (!quotation) {
    return null;
  }

  return mapQuotation((quotation as unknown) as QuotationRow, ((items ?? []) as unknown) as ItemRow[]);
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  if (!isSupabaseConfigured()) {
    return demoInvoices.find((invoice) => invoice.id === id) ?? null;
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const [{ data: invoice }, { data: items }] = await Promise.all([
    supabase
      .from("invoices")
      .select(
        "id,invoice_number,project_id,quotation_id,status,issue_date,due_date,subtotal,discount_amount,vat_rate,vat_amount,total,paid_amount,balance_due,deposit_amount,terms_en,terms_ar,notes,projects(name,clients(name))"
      )
      .eq("owner_id", user.id)
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("invoice_items")
      .select("id,description,quantity,unit,unit_rate,total")
      .eq("owner_id", user.id)
      .eq("invoice_id", id)
      .is("deleted_at", null)
      .order("sort_order")
  ]);

  if (!invoice) {
    return null;
  }

  return mapInvoice((invoice as unknown) as InvoiceRow, ((items ?? []) as unknown) as ItemRow[]);
}

function mapQuotation(row: QuotationRow, itemRows: ItemRow[]): Quotation {
  const client = Array.isArray(row.projects?.clients) ? row.projects?.clients[0] : row.projects?.clients;
  return {
    id: row.id,
    quotationNumber: row.quotation_number,
    projectId: row.project_id,
    projectName: row.projects?.name,
    clientName: client?.name,
    boqId: row.boq_id,
    status: row.status,
    issueDate: row.issue_date,
    validUntil: row.valid_until,
    subtotal: Number(row.subtotal),
    discountAmount: Number(row.discount_amount),
    vatRate: Number(row.vat_rate),
    vatAmount: Number(row.vat_amount),
    total: Number(row.total),
    termsEn: row.terms_en,
    termsAr: row.terms_ar,
    notes: row.notes,
    items: itemRows.map(mapItem)
  };
}

function mapInvoice(row: InvoiceRow, itemRows: ItemRow[]): Invoice {
  const client = Array.isArray(row.projects?.clients) ? row.projects?.clients[0] : row.projects?.clients;
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    projectId: row.project_id,
    projectName: row.projects?.name,
    clientName: client?.name,
    quotationId: row.quotation_id,
    status: row.status,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    subtotal: Number(row.subtotal),
    discountAmount: Number(row.discount_amount),
    vatRate: Number(row.vat_rate),
    vatAmount: Number(row.vat_amount),
    total: Number(row.total),
    paidAmount: Number(row.paid_amount),
    balanceDue: Number(row.balance_due),
    depositAmount: Number(row.deposit_amount ?? 0),
    termsEn: row.terms_en,
    termsAr: row.terms_ar,
    notes: row.notes,
    items: itemRows.map(mapItem)
  };
}

function mapItem(row: ItemRow): DocumentItem {
  return {
    id: row.id,
    description: row.description,
    quantity: Number(row.quantity),
    unit: row.unit,
    unitRate: Number(row.unit_rate),
    total: Number(row.total)
  };
}
