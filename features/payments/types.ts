export type Payment = {
  id: string;
  projectId?: string | null;
  projectName?: string | null;
  clientName?: string | null;
  supplierId?: string | null;
  supplierName?: string | null;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  direction: "client_in" | "supplier_out";
  status: "pending" | "completed" | "failed" | "cancelled";
  amount: number;
  paymentDate: string;
  method?: string | null;
  reference?: string | null;
  notes?: string | null;
  reminderAt?: string | null;
};
