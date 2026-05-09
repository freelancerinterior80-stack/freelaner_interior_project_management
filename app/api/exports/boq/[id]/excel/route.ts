import { notFound } from "next/navigation";
import { getBoqById } from "@/features/boq/queries";
import { boqToCsv } from "@/features/boq/spreadsheet";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const boq = await getBoqById(id);

  if (!boq) {
    notFound();
  }

  const csv = boqToCsv(boq);

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${boq.name.replaceAll(" ", "-")}-boq.csv"`
    }
  });
}
