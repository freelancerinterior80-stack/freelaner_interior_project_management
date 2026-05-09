"use client";

import { useActionState } from "react";
import { Boxes } from "lucide-react";
import { createMaterial, type MaterialActionState } from "@/features/materials/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: MaterialActionState = { ok: false };

export function MaterialForm() {
  const [state, action, pending] = useActionState(createMaterial, initialState);

  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="p-4">
        <form action={action} className="space-y-4">
          <h2 className="font-semibold text-charcoal-900">Add material</h2>
          <div className="space-y-2">
            <Label htmlFor="name">Material name</Label>
            <Input id="name" name="name" placeholder="Plywood sheets" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplierName">Supplier</Label>
            <Input id="supplierName" name="supplierName" placeholder="Optional supplier name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <select id="unit" name="unit" className="h-12 w-full rounded-md border border-input bg-card px-3 text-base">
                <option value="units">Units</option>
                <option value="m2">M2</option>
                <option value="mtr">Mtr</option>
                <option value="ps">PS</option>
                <option value="ls">LS</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitCost">Unit cost</Label>
              <Input id="unitCost" name="unitCost" type="number" step="0.01" defaultValue="0" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="currentStock">Current stock</Label>
              <Input id="currentStock" name="currentStock" type="number" step="0.001" defaultValue="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low alert</Label>
              <Input id="lowStockThreshold" name="lowStockThreshold" type="number" step="0.001" defaultValue="0" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" placeholder="Optional" />
          </div>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button className="w-full" disabled={pending}>
            <Boxes className="h-4 w-4" />
            {pending ? "Saving..." : "Save material"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
