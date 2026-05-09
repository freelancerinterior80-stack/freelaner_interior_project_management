import { notFound } from "next/navigation";
import { DocumentDetail } from "@/features/documents/components/document-detail";
import { getInvoiceById } from "@/features/documents/queries";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params;
  const invoice = await getInvoiceById(invoiceId);

  if (!invoice) {
    notFound();
  }

  return <DocumentDetail kind="invoice" document={invoice} />;
}
