import { DocumentList } from "@/features/documents/components/document-list";
import { getQuotationSummaries } from "@/features/documents/queries";

export default async function QuotationsPage() {
  const quotations = await getQuotationSummaries();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-wood-700">Quotations</p>
        <h1 className="text-2xl font-semibold text-charcoal-900">Client offers</h1>
      </div>
      <DocumentList
        documents={quotations}
        basePath="/quotations"
        emptyText="No quotations yet. Convert a BOQ to create the first one."
      />
    </div>
  );
}
