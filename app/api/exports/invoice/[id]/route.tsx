import { renderToBuffer } from "@react-pdf/renderer";
import { notFound } from "next/navigation";
import { InvoicePdf } from "@/features/documents/pdf";
import { getInvoiceById } from "@/features/documents/queries";
import { getSettings } from "@/features/settings/queries";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  const lang = (new URL(request.url).searchParams.get("lang") ?? "en") as "en" | "ar";

  try {
    const settings = await getSettings();
    const buffer = await renderToBuffer(<InvoicePdf invoice={invoice} settings={settings} language={lang} />);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${invoice.invoiceNumber}${lang === "ar" ? "-ar" : ""}.pdf"`
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF generation failed.";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}
