"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { addBoqItem, type BoqActionState } from "@/features/boq/actions";
import type { Boq } from "@/features/boq/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: BoqActionState = { ok: false };

export function AddBoqItemForm({ boq }: { boq: Boq }) {
  const [state, action, pending] = useActionState(addBoqItem, initialState);

  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="p-4">
        <form action={action} className="space-y-4">
          <input type="hidden" name="boqId" value={boq.id} />
          <h2 className="font-semibold text-charcoal-900">Add item</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <select
                id="categoryId"
                name="categoryId"
                className="h-12 w-full rounded-md border border-input bg-card px-3 text-base"
              >
                <option value="">New or ungrouped</option>
                {boq.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryName">New category</Label>
              <Input id="categoryName" name="categoryName" placeholder="Flooring" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Porcelain floor tiles" required />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Qty</Label>
              <Input id="quantity" name="quantity" type="number" step="0.001" defaultValue="1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <select
                id="unit"
                name="unit"
                className="h-12 w-full rounded-md border border-input bg-card px-2 text-base"
                defaultValue="units"
              >
                <option value="m2">M2</option>
                <option value="ls">LS</option>
                <option value="mtr">Mtr</option>
                <option value="ps">PS</option>
                <option value="units">Units</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitRate">Rate</Label>
              <Input id="unitRate" name="unitRate" type="number" step="0.01" defaultValue="0" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" placeholder="Optional" />
          </div>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button className="w-full" disabled={pending}>
            <Plus className="h-4 w-4" />
            {pending ? "Adding..." : "Add item"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
