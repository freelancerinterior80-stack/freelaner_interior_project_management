import type { Material, MaterialMovement, Supplier } from "@/features/materials/types";

export const demoSuppliers: Supplier[] = [
  { id: "demo-supplier-1", name: "Al Noor Materials", phone: "+966500000101" },
  { id: "demo-supplier-2", name: "Modern Lighting Co.", phone: "+966500000102" }
];

export const demoMaterials: Material[] = [
  {
    id: "demo-material-plywood",
    supplierId: "demo-supplier-1",
    supplierName: "Al Noor Materials",
    name: "Plywood sheets",
    unit: "units",
    currentStock: 4,
    lowStockThreshold: 8,
    unitCost: 95,
    notes: "18mm sheets"
  },
  {
    id: "demo-material-led",
    supplierId: "demo-supplier-2",
    supplierName: "Modern Lighting Co.",
    name: "LED profiles",
    unit: "mtr",
    currentStock: 9,
    lowStockThreshold: 10,
    unitCost: 38,
    notes: "Warm white profile"
  },
  {
    id: "demo-material-gypsum",
    supplierId: "demo-supplier-1",
    supplierName: "Al Noor Materials",
    name: "Gypsum boards",
    unit: "units",
    currentStock: 42,
    lowStockThreshold: 20,
    unitCost: 32,
    notes: null
  }
];

export const demoMaterialMovements: MaterialMovement[] = [
  {
    id: "demo-move-1",
    materialId: "demo-material-gypsum",
    materialName: "Gypsum boards",
    projectId: "demo-villa-fit-out",
    projectName: "Villa Fit-out",
    supplierName: "Al Noor Materials",
    movementType: "purchase",
    quantity: 60,
    unitCost: 32,
    movementDate: "2026-05-08",
    notes: "Initial purchase"
  },
  {
    id: "demo-move-2",
    materialId: "demo-material-plywood",
    materialName: "Plywood sheets",
    projectId: "demo-office-interior",
    projectName: "Office Interior",
    movementType: "usage",
    quantity: 6,
    unitCost: 95,
    movementDate: "2026-05-07",
    notes: "Used for joinery mockup"
  }
];
