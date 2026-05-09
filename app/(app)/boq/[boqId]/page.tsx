import { notFound } from "next/navigation";
import { BoqDetail } from "@/features/boq/components/boq-detail";
import { getBoqById } from "@/features/boq/queries";

export default async function BoqDetailPage({ params }: { params: Promise<{ boqId: string }> }) {
  const { boqId } = await params;
  const boq = await getBoqById(boqId);

  if (!boq) {
    notFound();
  }

  return <BoqDetail boq={boq} />;
}
