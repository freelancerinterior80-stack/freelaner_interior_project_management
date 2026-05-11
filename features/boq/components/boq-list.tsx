import Link from "next/link";
import type { Route } from "next";
import { Copy, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";
import type { BoqSummary } from "@/features/boq/types";
import { DeleteBoqButton } from "@/features/boq/components/delete-boq-button";

export function BoqList({ boqs }: { boqs: BoqSummary[] }) {
  if (boqs.length === 0) {
    return (
      <Card className="border-0 shadow-soft">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No BOQs yet. Create one from a project or start a reusable template.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {boqs.map((boq) => (
        <div key={boq.id} className="relative">
          {/* Full-card tap target for navigation */}
          <Link href={`/boq/${boq.id}` as Route} className="block">
            <Card className="border-0 shadow-soft transition-transform active:scale-[0.99]">
              <CardContent className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-charcoal-900">{boq.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {boq.projectName ?? "Template"} {boq.clientName ? `- ${boq.clientName}` : ""}
                    </p>
                  </div>
                  {/* Spacer so badge doesn't overlap the delete button */}
                  <div className="flex items-center gap-2 pr-7">
                    <Badge variant={boq.isTemplate ? "outline" : "secondary"}>
                      {boq.isTemplate ? "Template" : "Project"}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-secondary p-3">
                    <FileText className="mb-2 h-4 w-4 text-wood-700" />
                    <p className="text-xs text-muted-foreground">Items</p>
                    <p className="font-semibold text-charcoal-900">{boq.itemCount}</p>
                  </div>
                  <div className="rounded-md bg-secondary p-3">
                    <Copy className="mb-2 h-4 w-4 text-wood-700" />
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-semibold text-charcoal-900">{formatMoney(boq.subtotal)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Delete button — sits above the link layer */}
          <div className="absolute right-3 top-3 z-10">
            <DeleteBoqButton boqId={boq.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
