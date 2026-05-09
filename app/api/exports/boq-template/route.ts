import { getBoqCsvTemplate } from "@/features/boq/spreadsheet";

export async function GET() {
  return new Response(getBoqCsvTemplate(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="boq-import-template.csv"'
    }
  });
}
