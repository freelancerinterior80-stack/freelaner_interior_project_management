import { getVatAmount, getDocumentTotal } from "@/features/boq/calculations";
import { demoBoqs } from "@/features/boq/demo-data";
import type { Invoice, Quotation } from "@/features/documents/types";

const boq = demoBoqs[0];
const items = [...boq.categories.flatMap((category) => category.items), ...boq.ungroupedItems];
const vatRate = 0.15;

export const demoQuotations: Quotation[] = [
  {
    id: "demo-qtn-001",
    quotationNumber: "QTN-0001",
    projectId: boq.projectId,
    projectName: boq.projectName,
    clientName: boq.clientName,
    boqId: boq.id,
    status: "sent",
    issueDate: "2026-05-09",
    validUntil: "2026-06-08",
    subtotal: boq.subtotal,
    discountAmount: 0,
    vatRate,
    vatAmount: getVatAmount(boq.subtotal, vatRate),
    total: getDocumentTotal(boq.subtotal, vatRate),
    termsEn: "Payment as agreed. Materials subject to market availability.",
    termsAr: "الدفع حسب الاتفاق. المواد حسب توفر السوق.",
    notes: "Generated from BOQ.",
    items
  }
];

export const demoInvoices: Invoice[] = [
  {
    id: "demo-inv-001",
    invoiceNumber: "INV-0001",
    projectId: boq.projectId,
    projectName: boq.projectName,
    clientName: boq.clientName,
    quotationId: demoQuotations[0].id,
    status: "part_paid",
    issueDate: "2026-05-09",
    dueDate: "2026-05-24",
    subtotal: boq.subtotal,
    discountAmount: 0,
    vatRate,
    vatAmount: getVatAmount(boq.subtotal, vatRate),
    total: getDocumentTotal(boq.subtotal, vatRate),
    paidAmount: 12000,
    balanceDue: getDocumentTotal(boq.subtotal, vatRate) - 12000,
    depositAmount: 0,
    termsEn: "Please transfer to the bank details listed in the company profile.",
    termsAr: "يرجى التحويل إلى الحساب البنكي الموضح في ملف الشركة.",
    notes: "Advance invoice.",
    items
  }
];
