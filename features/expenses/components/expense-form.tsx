"use client";

import { useActionState, useState } from "react";
import { Receipt } from "lucide-react";
import { createExpense, type ExpenseActionState } from "@/features/expenses/actions";
import { useOfflineStore } from "@/features/offline/store";
import type { ProjectOption } from "@/features/boq/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ExpenseActionState = { ok: false };
const categories = ["labor", "material", "transport", "furniture", "electrical", "miscellaneous"];

export function ExpenseForm({ projects }: { projects: ProjectOption[] }) {
  const [state, action, pending] = useActionState(createExpense, initialState);
  const addDraft = useOfflineStore((store) => store.addDraft);
  const [offlineSaved, setOfflineSaved] = useState(false);

  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="p-4">
        <form
          action={action}
          className="space-y-4"
          onSubmit={(event) => {
            if (navigator.onLine) {
              return;
            }

            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const amount = String(formData.get("amount") ?? "");
            const description = String(formData.get("description") ?? "");
            addDraft({
              kind: "expense",
              label: description || "Offline expense",
              payload: {
                amount,
                category: String(formData.get("category") ?? "miscellaneous"),
                projectId: String(formData.get("projectId") ?? "") || undefined,
                supplierName: String(formData.get("supplierName") ?? "") || undefined,
                expenseDate: String(formData.get("expenseDate") ?? ""),
                description: description || undefined
              }
            });
            setOfflineSaved(true);
            event.currentTarget.reset();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" step="0.01" inputMode="decimal" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select id="category" name="category" className="h-12 w-full rounded-md border border-input bg-card px-3 text-base">
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenseDate">Date</Label>
              <Input id="expenseDate" name="expenseDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectId">Project</Label>
            <select id="projectId" name="projectId" className="h-12 w-full rounded-md border border-input bg-card px-3 text-base">
              <option value="">No project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} - {project.clientName}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplierName">Supplier</Label>
            <Input id="supplierName" name="supplierName" placeholder="Optional supplier name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Short note" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bill">Bill photo</Label>
            <Input id="bill" name="bill" type="file" accept="image/*,application/pdf" />
          </div>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {offlineSaved ? (
            <p className="rounded-md bg-secondary p-3 text-sm text-charcoal-700">
              Saved on this phone. It will sync when the connection returns.
            </p>
          ) : null}
          <Button className="w-full" disabled={pending}>
            <Receipt className="h-4 w-4" />
            {pending ? "Saving..." : "Save expense"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
