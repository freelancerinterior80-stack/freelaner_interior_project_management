"use client";

import { useActionState, useState } from "react";
import { FileText } from "lucide-react";
import { createInvoiceFromQuotation, type CreateInvoiceState } from "@/features/documents/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { formatMoney } from "@/lib/utils";

const initialState: CreateInvoiceState = { ok: false };

interface Props {
  quotationId: string;
  subtotal: number;
  discountAmount: number;
  vatRate: number;
  total: number;
}

export function CreateInvoiceSheet({ quotationId, subtotal, discountAmount, vatRate, total }: Props) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createInvoiceFromQuotation, initialState);
  const [deposit, setDeposit] = useState(0);

  const today = new Date().toISOString().slice(0, 10);
  const balance = Math.max(0, total - deposit);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="w-full">
          <FileText className="h-4 w-4" />
          Convert to invoice
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8 max-h-[90dvh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Create invoice</SheetTitle>
        </SheetHeader>

        <form action={action} className="space-y-5">
          <input type="hidden" name="quotationId" value={quotationId} />
          <input type="hidden" name="vatRate" value={vatRate} />
          <input type="hidden" name="discountAmount" value={discountAmount} />
          <input type="hidden" name="depositAmount" value={deposit} />

          {/* Summary */}
          <div className="space-y-1.5 rounded-md bg-secondary p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatMoney(subtotal)}</span>
            </div>
            {discountAmount > 0 ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium">- {formatMoney(discountAmount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-border pt-1.5">
              <span className="font-semibold">Invoice total</span>
              <span className="font-semibold text-charcoal-900">{formatMoney(total)}</span>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ci-issue">Issue date</Label>
              <Input id="ci-issue" name="issueDate" type="date" defaultValue={today} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ci-due">Due date</Label>
              <Input id="ci-due" name="dueDate" type="date" />
            </div>
          </div>

          {/* Advance payment */}
          <div className="space-y-2">
            <Label htmlFor="ci-deposit">Advance payment</Label>
            <Input
              id="ci-deposit"
              type="number"
              step="0.001"
              min="0"
              max={total}
              value={deposit === 0 ? "" : deposit}
              placeholder="Enter advance amount (optional)"
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setDeposit(isNaN(v) ? 0 : Math.min(v, total));
              }}
            />

            <div className="space-y-1.5 rounded-md bg-secondary p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Advance payment</span>
                <span className="font-semibold text-charcoal-900">
                  {deposit > 0 ? formatMoney(deposit) : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining payment</span>
                <span className="font-semibold text-charcoal-900">{formatMoney(balance)}</span>
              </div>
            </div>
          </div>

          {state.error ? (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p>
          ) : null}

          <Button className="w-full" disabled={pending}>
            <FileText className="h-4 w-4" />
            {pending ? "Creating…" : "Create invoice"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
