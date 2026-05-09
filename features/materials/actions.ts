"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const materialSchema = z.object({
  name: z.string().min(2, "Material name is required."),
  supplierName: z.string().optional(),
  unit: z.enum(["m2", "ls", "mtr", "ps", "units"]),
  currentStock: z.coerce.number().min(0),
  lowStockThreshold: z.coerce.number().min(0),
  unitCost: z.coerce.number().min(0),
  notes: z.string().optional()
});

const movementSchema = z.object({
  materialId: z.string().min(1, "Choose a material."),
  projectId: z.string().optional(),
  supplierId: z.string().optional(),
  movementType: z.enum(["purchase", "usage", "adjustment"]),
  quantity: z.coerce.number().min(0.001, "Quantity is required."),
  unitCost: z.coerce.number().min(0),
  movementDate: z.string().min(1, "Date is required."),
  notes: z.string().optional()
});

export type MaterialActionState = {
  ok: boolean;
  error?: string;
};

export async function createMaterial(_: MaterialActionState, formData: FormData): Promise<MaterialActionState> {
  const parsed = materialSchema.safeParse({
    name: formData.get("name"),
    supplierName: formData.get("supplierName") || undefined,
    unit: formData.get("unit"),
    currentStock: formData.get("currentStock"),
    lowStockThreshold: formData.get("lowStockThreshold"),
    unitCost: formData.get("unitCost"),
    notes: formData.get("notes") || undefined
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check material details." };
  }

  if (!isSupabaseConfigured()) {
    redirect("/materials");
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  let supplierId: string | null = null;

  if (parsed.data.supplierName) {
    const { data: supplier, error: supplierError } = await supabase
      .from("suppliers")
      .insert({ owner_id: user.id, name: parsed.data.supplierName })
      .select("id")
      .single();

    if (supplierError || !supplier) {
      return { ok: false, error: supplierError?.message ?? "Could not save supplier." };
    }

    supplierId = supplier.id;
  }

  const { error } = await supabase.from("materials").insert({
    owner_id: user.id,
    supplier_id: supplierId,
    name: parsed.data.name,
    unit: parsed.data.unit,
    current_stock: parsed.data.currentStock,
    low_stock_threshold: parsed.data.lowStockThreshold,
    unit_cost: parsed.data.unitCost,
    notes: parsed.data.notes || null
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/materials");
  redirect("/materials");
}

export async function recordMaterialMovement(_: MaterialActionState, formData: FormData): Promise<MaterialActionState> {
  const parsed = movementSchema.safeParse({
    materialId: formData.get("materialId"),
    projectId: formData.get("projectId") || undefined,
    supplierId: formData.get("supplierId") || undefined,
    movementType: formData.get("movementType"),
    quantity: formData.get("quantity"),
    unitCost: formData.get("unitCost"),
    movementDate: formData.get("movementDate"),
    notes: formData.get("notes") || undefined
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check movement details." };
  }

  if (!isSupabaseConfigured()) {
    redirect("/materials");
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("material_movements").insert({
    owner_id: user.id,
    material_id: parsed.data.materialId,
    project_id: parsed.data.projectId || null,
    supplier_id: parsed.data.supplierId || null,
    movement_type: parsed.data.movementType,
    quantity: parsed.data.quantity,
    unit_cost: parsed.data.unitCost,
    movement_date: parsed.data.movementDate,
    notes: parsed.data.notes || null
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const multiplier = parsed.data.movementType === "usage" ? -1 : 1;
  await supabase.rpc("adjust_material_stock", {
    target_material_id: parsed.data.materialId,
    delta_quantity: parsed.data.quantity * multiplier
  });

  revalidatePath("/dashboard");
  revalidatePath("/materials");
  redirect("/materials");
}
