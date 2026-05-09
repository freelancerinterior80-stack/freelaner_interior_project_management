import { renderToBuffer } from "@react-pdf/renderer";
import { ReportPdf } from "@/features/reports/pdf";
import { getReportData } from "@/features/reports/queries";
import { getSettings } from "@/features/settings/queries";

export const runtime = "nodejs";

export async function GET() {
  const data = await getReportData();
  const settings = await getSettings();
  const buffer = await renderToBuffer(<ReportPdf data={data} settings={settings} />);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": 'inline; filename="business-snapshot.pdf"'
    }
  });
}
