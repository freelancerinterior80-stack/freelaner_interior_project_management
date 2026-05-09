"use client";

import { useActionState } from "react";
import { WalletCards } from "lucide-react";
import { createPayment, type PaymentActionState } from "@/features/payments/actions";
import type { ProjectOption } from "@/features/boq/types";
import type { DocumentSummary } from "@/features/documents/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: PaymentActionState = { ok: false };

export function PaymentForm({
  projects,
  invoices
}: {
  projects: ProjectOption[];
  invoices: DocumentSummary[];
}) {
  const [state, action, pending] = useActionState(createPayment, initialState);

  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="p-4">
        <form action={action} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="direction">Direction</Label>
              <select id="direction" name="direction" className="h-12 w-full rounded-md border border-input bg-card px-3 text-base">
                <option value="client_in">Client in</option>
                <option value="supplier_out">Supplier out</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" className="h-12 w-full rounded-md border border-input bg-card px-3 text-base">
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" step="0.01" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Date</Label>
              <Input id="paymentDate" name="paymentDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectId">Project</Label>
            <select id="projectId" name="projectId" className="h-12 w-full rounded-md border border-input bg-card px-3 text-base">
              <option value="">No project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceId">Invoice</Label>
            <select id="invoiceId" name="invoiceId" className="h-12 w-full rounded-md border border-input bg-card px-3 text-base">
              <option value="">No invoice</option>
              {invoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.number} - {invoice.projectName ?? "Project"}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplierName">Supplier</Label>
            <Input id="supplierName" name="supplierName" placeholder="Only for supplier payments" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="method">Method</Label>
              <Input id="method" name="method" placeholder="Cash, bank..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input id="reference" name="reference" placeholder="Optional" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminderAt">Reminder</Label>
            <Input id="reminderAt" name="reminderAt" type="datetime-local" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" placeholder="Optional" />
          </div>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button className="w-full" disabled={pending}>
            <WalletCards className="h-4 w-4" />
            {pending ? "Saving..." : "Save payment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
