"use client";

import { useActionState, useEffect, useState } from "react";
import { WalletCards } from "lucide-react";
import { recordInvoicePayment, type RecordPaymentState } from "@/features/documents/actions-payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

const initialState: RecordPaymentState = { ok: false };

interface Props {
  invoiceId: string;
  balanceDue: number;
}

export function RecordPaymentSheet({ invoiceId, balanceDue }: Props) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(recordInvoicePayment, initialState);

  // Close sheet on success
  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state.ok]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" className="w-full">
          <WalletCards className="h-4 w-4" />
          Record payment
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader className="mb-4">
          <SheetTitle>Record payment</SheetTitle>
        </SheetHeader>

        <form action={action} className="space-y-4">
          <input type="hidden" name="invoiceId" value={invoiceId} />

          <div className="rounded-md bg-secondary p-3 text-sm">
            <span className="text-muted-foreground">Balance due: </span>
            <span className="font-semibold text-charcoal-900">{formatMoney(balanceDue)}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rp-amount">Amount received</Label>
            <Input
              id="rp-amount"
              name="amount"
              type="number"
              step="0.001"
              min="0.001"
              max={balanceDue}
              defaultValue={balanceDue.toFixed(3)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="rp-method">Method</Label>
              <select
                id="rp-method"
                name="method"
                className="h-12 w-full rounded-md border border-input bg-card px-3 text-base"
              >
                <option value="">—</option>
                <option value="Cash">Cash</option>
                <option value="Bank transfer">Bank transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="KNET">KNET</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rp-date">Date</Label>
              <Input id="rp-date" name="paymentDate" type="date" defaultValue={today} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rp-reference">Reference / note</Label>
            <Input id="rp-reference" name="reference" placeholder="Optional" />
          </div>

          {state.error ? (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p>
          ) : null}

          <Button className="w-full" disabled={pending}>
            <WalletCards className="h-4 w-4" />
            {pending ? "Saving…" : "Save payment"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
