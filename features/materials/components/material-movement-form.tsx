"use client";

import { useActionState } from "react";
import { ArrowDownUp } from "lucide-react";
import { recordMaterialMovement, type MaterialActionState } from "@/features/materials/actions";
import type { ProjectOption } from "@/features/boq/types";
import type { Material, Supplier } from "@/features/materials/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: MaterialActionState = { ok: false };

export function MaterialMovementForm({
  materials,
  projects,
  suppliers
}: {
  materials: Material[];
  projects: ProjectOption[];
  suppliers: Supplier[];
}) {
  const [state, action, pending] = useActionState(recordMaterialMovement, initialState);

  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="p-4">
        <form action={action} className="space-y-4">
          <h2 className="font-semibold text-charcoal-900">Record movement</h2>
          <div className="space-y-2">
            <Label htmlFor="materialId">Material</Label>
            <select id="materialId" name="materialId" className="h-12 w-full rounded-md border border-input bg-card px-3 text-base">
              {materials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="movementType">Type</Label>
              <select id="movementType" name="movementType" className="h-12 w-full rounded-md border border-input bg-card px-3 text-base">
                <option value="purchase">Purchase</option>
                <option value="usage">Usage</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="movementDate">Date</Label>
              <Input id="movementDate" name="movementDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Qty</Label>
              <Input id="quantity" name="quantity" type="number" step="0.001" defaultValue="1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitCost">Unit cost</Label>
              <Input id="unitCost" name="unitCost" type="number" step="0.01" defaultValue="0" required />
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
            <Label htmlFor="supplierId">Supplier</Label>
            <select id="supplierId" name="supplierId" className="h-12 w-full rounded-md border border-input bg-card px-3 text-base">
              <option value="">No supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" placeholder="Optional" />
          </div>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button className="w-full" disabled={pending || materials.length === 0}>
            <ArrowDownUp className="h-4 w-4" />
            {pending ? "Saving..." : "Save movement"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
