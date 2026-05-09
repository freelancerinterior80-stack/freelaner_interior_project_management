import { renderToBuffer } from "@react-pdf/renderer";
import { notFound } from "next/navigation";
import { QuotationPdf } from "@/features/documents/pdf";
import { getQuotationById } from "@/features/documents/queries";
import { getSettings } from "@/features/settings/queries";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quotation = await getQuotationById(id);

  if (!quotation) {
    notFound();
  }

  const settings = await getSettings();
  const buffer = await renderToBuffer(<QuotationPdf quotation={quotation} settings={settings} />);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${quotation.quotationNumber}.pdf"`
    }
  });
}
