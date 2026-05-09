import { renderToBuffer } from "@react-pdf/renderer";
import { notFound } from "next/navigation";
import { BoqPdf } from "@/features/documents/pdf";
import { getBoqById } from "@/features/boq/queries";
import { getSettings } from "@/features/settings/queries";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const boq = await getBoqById(id);

  if (!boq) {
    notFound();
  }

  const settings = await getSettings();
  const buffer = await renderToBuffer(<BoqPdf boq={boq} settings={settings} />);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${boq.name.replaceAll(" ", "-")}.pdf"`
    }
  });
}
