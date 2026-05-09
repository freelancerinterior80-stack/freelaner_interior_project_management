import { getProjectOptions } from "@/features/boq/queries";
import { getInvoiceSummaries } from "@/features/documents/queries";
import { PaymentForm } from "@/features/payments/components/payment-form";

export default async function NewPaymentPage() {
  const [projects, invoices] = await Promise.all([getProjectOptions(), getInvoiceSummaries()]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-wood-700">New payment</p>
        <h1 className="text-2xl font-semibold text-charcoal-900">Record cash movement</h1>
      </div>
      <PaymentForm projects={projects} invoices={invoices} />
    </div>
  );
}
