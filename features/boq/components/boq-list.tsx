import Link from "next/link";
import type { Route } from "next";
import { Copy, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";
import type { BoqSummary } from "@/features/boq/types";

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
        <Link key={boq.id} href={`/boq/${boq.id}` as Route}>
          <Card className="border-0 shadow-soft transition-transform active:scale-[0.99]">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-charcoal-900">{boq.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {boq.projectName ?? "Template"} {boq.clientName ? `- ${boq.clientName}` : ""}
                  </p>
                </div>
                <Badge variant={boq.isTemplate ? "outline" : "secondary"}>
                  {boq.isTemplate ? "Template" : "Project"}
                </Badge>
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
      ))}
    </div>
  );
}
