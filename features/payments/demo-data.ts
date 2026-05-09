import type { Payment } from "@/features/payments/types";

export const demoPayments: Payment[] = [
  {
    id: "demo-pay-1",
    projectId: "demo-villa-fit-out",
    projectName: "Villa Fit-out",
    clientName: "Ahmed Al Saud",
    invoiceId: "demo-inv-001",
    invoiceNumber: "INV-0001",
    direction: "client_in",
    status: "completed",
    amount: 12000,
    paymentDate: "2026-05-09",
    method: "Bank transfer",
    reference: "TRX-1098"
  },
  {
    id: "demo-pay-2",
    projectId: "demo-office-interior",
    projectName: "Office Interior",
    clientName: "Noura Studio",
    direction: "client_in",
    status: "pending",
    amount: 18500,
    paymentDate: "2026-05-13",
    reminderAt: "2026-05-13T09:00:00+03:00",
    notes: "Follow up after BOQ approval"
  },
  {
    id: "demo-pay-3",
    projectId: "demo-villa-fit-out",
    projectName: "Villa Fit-out",
    supplierName: "Al Noor Materials",
    direction: "supplier_out",
    status: "completed",
    amount: 4500,
    paymentDate: "2026-05-08",
    method: "Cash"
  }
];
