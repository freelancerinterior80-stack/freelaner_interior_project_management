import type { BoqUnit } from "@/features/boq/types";

export type Supplier = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

export type Material = {
  id: string;
  supplierId?: string | null;
  supplierName?: string | null;
  name: string;
  unit: BoqUnit;
  currentStock: number;
  lowStockThreshold: number;
  unitCost: number;
  notes?: string | null;
};

export type MaterialMovement = {
  id: string;
  materialId: string;
  materialName?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  supplierId?: string | null;
  supplierName?: string | null;
  movementType: "purchase" | "usage" | "adjustment";
  quantity: number;
  unitCost: number;
  movementDate: string;
  notes?: string | null;
};
