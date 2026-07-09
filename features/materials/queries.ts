import { isSupabaseConfigured } from "@/lib/supabase/config";
import { requireUser } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { assertNoQueryError } from "@/lib/supabase/query-error";
import { demoMaterialMovements, demoMaterials, demoSuppliers } from "@/features/materials/demo-data";
import type { Material, MaterialMovement, Supplier } from "@/features/materials/types";

type MaterialRow = {
  id: string;
  supplier_id: string | null;
  name: string;
  unit: Material["unit"];
  current_stock: number | string;
  low_stock_threshold: number | string;
  unit_cost: number | string;
  notes: string | null;
  suppliers: { name: string } | null;
};

type SupplierRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
};

type MovementRow = {
  id: string;
  material_id: string;
  project_id: string | null;
  supplier_id: string | null;
  movement_type: MaterialMovement["movementType"];
  quantity: number | string;
  unit_cost: number | string;
  movement_date: string;
  notes: string | null;
  materials: { name: string } | null;
  projects: { name: string } | null;
  suppliers: { name: string } | null;
};

export async function getMaterials(): Promise<Material[]> {
  if (!isSupabaseConfigured()) {
    return demoMaterials;
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("materials")
    .select("id,supplier_id,name,unit,current_stock,low_stock_threshold,unit_cost,notes,suppliers(name)")
    .eq("owner_id", user.id)
    .is("deleted_at", null)
    .order("name");

  assertNoQueryError(error, "materials");

  return ((data ?? []) as unknown as MaterialRow[]).map((row) => ({
    id: row.id,
    supplierId: row.supplier_id,
    supplierName: row.suppliers?.name,
    name: row.name,
    unit: row.unit,
    currentStock: Number(row.current_stock),
    lowStockThreshold: Number(row.low_stock_threshold),
    unitCost: Number(row.unit_cost),
    notes: row.notes
  }));
}

export async function getSuppliers(): Promise<Supplier[]> {
  if (!isSupabaseConfigured()) {
    return demoSuppliers;
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select("id,name,phone,email,address")
    .eq("owner_id", user.id)
    .is("deleted_at", null)
    .order("name");

  assertNoQueryError(error, "suppliers");

  return ((data ?? []) as unknown as SupplierRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    address: row.address
  }));
}

export async function getMaterialMovements(): Promise<MaterialMovement[]> {
  if (!isSupabaseConfigured()) {
    return demoMaterialMovements;
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("material_movements")
    .select("id,material_id,project_id,supplier_id,movement_type,quantity,unit_cost,movement_date,notes,materials(name),projects(name),suppliers(name)")
    .eq("owner_id", user.id)
    .is("deleted_at", null)
    .order("movement_date", { ascending: false })
    .limit(10);

  assertNoQueryError(error, "material movements");

  return ((data ?? []) as unknown as MovementRow[]).map((row) => ({
    id: row.id,
    materialId: row.material_id,
    materialName: row.materials?.name,
    projectId: row.project_id,
    projectName: row.projects?.name,
    supplierId: row.supplier_id,
    supplierName: row.suppliers?.name,
    movementType: row.movement_type,
    quantity: Number(row.quantity),
    unitCost: Number(row.unit_cost),
    movementDate: row.movement_date,
    notes: row.notes
  }));
}
