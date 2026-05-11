"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { updateDocumentTerms, type UpdateTermsState } from "@/features/documents/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

const initial: UpdateTermsState = { ok: false };

interface Props {
  id: string;
  kind: "quotation" | "invoice";
  termsEn?: string | null;
  termsAr?: string | null;
  notes?: string | null;
}

export function EditTermsSheet({ id, kind, termsEn, termsAr, notes }: Props) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateDocumentTerms, initial);

  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state.ok]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Pencil className="h-3.5 w-3.5" />
          Edit terms
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="mb-4">
          <SheetTitle>Edit Terms &amp; Notes</SheetTitle>
        </SheetHeader>
        <form action={action} className="space-y-4">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="kind" value={kind} />

          <div className="space-y-2">
            <Label htmlFor="termsEn">Terms (English)</Label>
            <Textarea
              id="termsEn"
              name="termsEn"
              defaultValue={termsEn ?? ""}
              rows={4}
              placeholder="Payment as agreed. Materials subject to market availability."
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="termsAr">Terms (Arabic)</Label>
            <Textarea
              id="termsAr"
              name="termsAr"
              defaultValue={termsAr ?? ""}
              rows={4}
              dir="rtl"
              placeholder="الدفع حسب الاتفاق. المواد حسب توفر السوق."
              className="resize-none text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Internal notes (not shown on PDF)</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={notes ?? ""}
              rows={3}
              placeholder="e.g. client requested special payment schedule"
              className="resize-none"
            />
          </div>

          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}

          <Button className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
