"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { importBoqItems, type BoqActionState } from "@/features/boq/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: BoqActionState = { ok: false };

export function ImportBoqItemsForm({ boqId }: { boqId: string }) {
  const [state, action, pending] = useActionState(importBoqItems, initialState);

  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="p-4">
        <form action={action} className="space-y-4">
          <input type="hidden" name="boqId" value={boqId} />
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-charcoal-900">Import from Excel</h2>
              <p className="mt-1 text-sm text-muted-foreground">Upload a CSV saved from Excel.</p>
            </div>
            <FileSpreadsheet className="h-5 w-5 text-wood-700" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="boq-file">Spreadsheet file</Label>
            <Input id="boq-file" name="file" type="file" accept=".csv,text/csv" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" asChild variant="secondary">
              <Link href="/api/exports/boq-template">
                <FileSpreadsheet className="h-4 w-4" />
                Template
              </Link>
            </Button>
            <Button disabled={pending}>
              <Upload className="h-4 w-4" />
              {pending ? "Importing..." : "Import"}
            </Button>
          </div>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
