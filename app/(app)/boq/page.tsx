import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BoqList } from "@/features/boq/components/boq-list";
import { getBoqSummaries } from "@/features/boq/queries";

export default async function BoqPage() {
  const boqs = await getBoqSummaries();

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-wood-700">BOQ</p>
          <h1 className="text-2xl font-semibold text-charcoal-900">Build and price work</h1>
        </div>
        <Button asChild size="sm">
          <Link href="/boq/new">
            <Plus className="h-4 w-4" />
            New
          </Link>
        </Button>
      </div>
      <BoqList boqs={boqs} />
    </div>
  );
}
