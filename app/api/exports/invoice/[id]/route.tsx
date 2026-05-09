import { renderToBuffer } from "@react-pdf/renderer";
import { notFound } from "next/navigation";
import { InvoicePdf } from "@/features/documents/pdf";
import { getInvoiceById } from "@/features/documents/queries";
import { getSettings } from "@/features/settings/queries";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  const settings = await getSettings();
  const buffer = await renderToBuffer(<InvoicePdf invoice={invoice} settings={settings} />);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`
    }
  });
}
