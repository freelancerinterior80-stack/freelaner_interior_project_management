import { notFound } from "next/navigation";
import { DocumentDetail } from "@/features/documents/components/document-detail";
import { getQuotationById } from "@/features/documents/queries";

export default async function QuotationDetailPage({
  params
}: {
  params: Promise<{ quotationId: string }>;
}) {
  const { quotationId } = await params;
  const quotation = await getQuotationById(quotationId);

  if (!quotation) {
    notFound();
  }

  return <DocumentDetail kind="quotation" document={quotation} />;
}
