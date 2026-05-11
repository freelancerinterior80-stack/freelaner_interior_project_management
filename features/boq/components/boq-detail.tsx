import Link from "next/link";
import { Download, FileSpreadsheet, FileText, MessageCircle, ReceiptText } from "lucide-react";
import { AddBoqItemForm } from "@/features/boq/components/add-boq-item-form";
import { EditBoqItemSheet } from "@/features/boq/components/edit-boq-item-sheet";
import { ImportBoqItemsForm } from "@/features/boq/components/import-boq-items-form";
import { CreateDocumentButtons } from "@/features/documents/components/create-document-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";
import type { Boq, BoqItem } from "@/features/boq/types";

export function BoqDetail({ boq }: { boq: Boq }) {
  const pdfHref = `/api/exports/boq/${boq.id}`;
  const excelHref = `/api/exports/boq/${boq.id}/excel`;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-wood-700">{boq.projectName ?? "Template"}</p>
          <h1 className="text-2xl font-semibold text-charcoal-900">{boq.name}</h1>
          {boq.clientName ? <p className="mt-1 text-sm text-muted-foreground">{boq.clientName}</p> : null}
        </div>
        <Badge variant={boq.isTemplate ? "outline" : "secondary"}>
          {boq.isTemplate ? "Template" : "BOQ"}
        </Badge>
      </div>

      <Card className="border-0 shadow-soft">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">BOQ total</p>
              <p className="text-3xl font-semibold text-charcoal-900">{formatMoney(boq.subtotal)}</p>
            </div>
            <ReceiptText className="h-10 w-10 text-wood-700" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Button asChild variant="secondary">
              <Link href={pdfHref} target="_blank">
                <Download className="h-4 w-4" />
                PDF
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={excelHref}>
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={`https://wa.me/?text=${encodeURIComponent(`BOQ ${boq.name}: ${pdfHref}`)}`}>
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Link>
            </Button>
          </div>
          <CreateDocumentButtons boqId={boq.id} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {boq.categories.map((category) => (
          <Card key={category.id} className="border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-charcoal-900">{category.name}</h2>
                <Badge variant="secondary">{category.items.length} items</Badge>
              </div>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <BoqItemCard key={item.id} item={item} boqId={boq.id} />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {boq.ungroupedItems.length > 0 ? (
          <Card className="border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-wood-700" />
                <h2 className="font-semibold text-charcoal-900">Other items</h2>
              </div>
              <div className="space-y-3">
                {boq.ungroupedItems.map((item) => (
                  <BoqItemCard key={item.id} item={item} boqId={boq.id} />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <AddBoqItemForm boq={boq} />
      <ImportBoqItemsForm boqId={boq.id} />
    </div>
  );
}

function BoqItemCard({ item, boqId }: { item: BoqItem; boqId: string }) {
  return (
    <div className="rounded-md bg-secondary p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-charcoal-900">{item.description}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {item.quantity} {item.unit.toUpperCase()} x {formatMoney(item.unitRate)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <p className="text-sm font-semibold text-charcoal-900">{formatMoney(item.total)}</p>
          <EditBoqItemSheet item={item} boqId={boqId} />
        </div>
      </div>
      {item.notes ? <p className="mt-2 text-xs text-muted-foreground">{item.notes}</p> : null}
    </div>
  );
}
