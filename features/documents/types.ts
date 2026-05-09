import type { BoqItem, BoqUnit } from "@/features/boq/types";

export type DocumentItem = Pick<BoqItem, "id" | "description" | "quantity" | "unit" | "unitRate" | "total"> & {
  unit: BoqUnit;
};

export type Quotation = {
  id: string;
  quotationNumber: string;
  projectId?: string | null;
  projectName?: string | null;
  clientName?: string | null;
  boqId?: string | null;
  status: "draft" | "issued" | "sent" | "accepted" | "rejected" | "cancelled";
  issueDate: string;
  validUntil?: string | null;
  subtotal: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  termsEn?: string | null;
  termsAr?: string | null;
  notes?: string | null;
  items: DocumentItem[];
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  projectId?: string | null;
  projectName?: string | null;
  clientName?: string | null;
  quotationId?: string | null;
  status: "draft" | "issued" | "sent" | "part_paid" | "paid" | "overdue" | "cancelled";
  issueDate: string;
  dueDate?: string | null;
  subtotal: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  termsEn?: string | null;
  termsAr?: string | null;
  notes?: string | null;
  items: DocumentItem[];
};

export type DocumentSummary = {
  id: string;
  number: string;
  projectName?: string | null;
  clientName?: string | null;
  status: string;
  total: number;
  date: string;
};
