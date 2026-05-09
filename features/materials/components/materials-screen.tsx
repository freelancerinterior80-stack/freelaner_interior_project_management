import { AlertTriangle, Boxes } from "lucide-react";
import { MaterialForm } from "@/features/materials/components/material-form";
import { MaterialMovementForm } from "@/features/materials/components/material-movement-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatMoney } from "@/lib/utils";
import type { ProjectOption } from "@/features/boq/types";
import type { Material, MaterialMovement, Supplier } from "@/features/materials/types";

export function MaterialsScreen({
  materials,
  movements,
  projects,
  suppliers
}: {
  materials: Material[];
  movements: MaterialMovement[];
  projects: ProjectOption[];
  suppliers: Supplier[];
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-wood-700">Materials</p>
        <h1 className="text-2xl font-semibold text-charcoal-900">Stock and suppliers</h1>
      </div>

      <div className="space-y-3">
        {materials.map((material) => {
          const low = material.currentStock <= material.lowStockThreshold;
          return (
            <Card key={material.id} className="border-0 shadow-soft">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-wood-700">
                      {low ? <AlertTriangle className="h-5 w-5 text-amber-700" /> : <Boxes className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal-900">{material.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {material.supplierName ?? "No supplier"} - {formatMoney(material.unitCost)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={low ? "warning" : "secondary"}>{low ? "Low" : "Stock"}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <MiniMetric label="Stock" value={`${material.currentStock}`} />
                  <MiniMetric label="Alert" value={`${material.lowStockThreshold}`} />
                  <MiniMetric label="Unit" value={material.unit.toUpperCase()} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <MaterialForm />
        <MaterialMovementForm materials={materials} projects={projects} suppliers={suppliers} />
      </div>

      <Card className="border-0 shadow-soft">
        <CardContent className="space-y-3 p-4">
          <h2 className="font-semibold text-charcoal-900">Recent movements</h2>
          {movements.map((movement) => (
            <div key={movement.id} className="flex items-center justify-between gap-3 rounded-md bg-secondary p-3 text-sm">
              <div>
                <p className="font-medium text-charcoal-900">{movement.materialName ?? "Material"}</p>
                <p className="mt-1 text-muted-foreground">
                  {movement.movementType} - {movement.projectName ?? movement.supplierName ?? "General"} - {formatDate(movement.movementDate)}
                </p>
              </div>
              <span className="font-semibold">{movement.quantity}</span>
            </div>
          ))}
          {movements.length === 0 ? <p className="text-sm text-muted-foreground">No movements yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary px-2 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-charcoal-900">{value}</p>
    </div>
  );
}
