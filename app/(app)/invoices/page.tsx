import { DocumentList } from "@/features/documents/components/document-list";
import { getInvoiceSummaries } from "@/features/documents/queries";

export default async function InvoicesPage() {
  const invoices = await getInvoiceSummaries();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-wood-700">Invoices</p>
        <h1 className="text-2xl font-semibold text-charcoal-900">Payment requests</h1>
      </div>
      <DocumentList
        documents={invoices}
        basePath="/invoices"
        emptyText="No invoices yet. Convert a quotation when the client approves."
      />
    </div>
  );
}
