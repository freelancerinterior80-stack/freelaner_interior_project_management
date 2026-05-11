"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseBoqCsv } from "@/features/boq/spreadsheet";

const createBoqSchema = z.object({
  name: z.string().min(2, "BOQ name is required."),
  projectId: z.string().optional(),
  isTemplate: z.boolean().default(false)
});

const addItemSchema = z.object({
  boqId: z.string().min(1),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  description: z.string().min(2, "Description is required."),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative."),
  unit: z.enum(["m2", "ls", "mtr", "ps", "units"]),
  unitRate: z.coerce.number().min(0, "Rate cannot be negative."),
  notes: z.string().optional()
});

export type BoqActionState = {
  ok: boolean;
  error?: string;
};

export async function createBoq(_: BoqActionState, formData: FormData): Promise<BoqActionState> {
  const parsed = createBoqSchema.safeParse({
    name: formData.get("name"),
    projectId: formData.get("projectId") || undefined,
    isTemplate: formData.get("isTemplate") === "on"
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check BOQ details." };
  }

  if (!isSupabaseConfigured()) {
    redirect("/boq/demo-boq-villa");
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("boqs")
    .insert({
      owner_id: user.id,
      project_id: parsed.data.projectId || null,
      name: parsed.data.name,
      is_template: parsed.data.isTemplate
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not create BOQ." };
  }

  revalidatePath("/boq");
  redirect(`/boq/${data.id}`);
}

export async function addBoqItem(_: BoqActionState, formData: FormData): Promise<BoqActionState> {
  const parsed = addItemSchema.safeParse({
    boqId: formData.get("boqId"),
    categoryId: formData.get("categoryId") || undefined,
    categoryName: formData.get("categoryName") || undefined,
    description: formData.get("description"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
    unitRate: formData.get("unitRate"),
    notes: formData.get("notes") || undefined
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check item details." };
  }

  if (!isSupabaseConfigured()) {
    redirect(`/boq/${parsed.data.boqId}`);
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  let categoryId = parsed.data.categoryId || null;

  if (!categoryId && parsed.data.categoryName) {
    const { data: category, error: categoryError } = await supabase
      .from("boq_categories")
      .insert({
        owner_id: user.id,
        boq_id: parsed.data.boqId,
        name: parsed.data.categoryName,
        sort_order: 100
      })
      .select("id")
      .single();

    if (categoryError || !category) {
      return { ok: false, error: categoryError?.message ?? "Could not create category." };
    }

    categoryId = category.id;
  }

  const { error } = await supabase.from("boq_items").insert({
    owner_id: user.id,
    boq_id: parsed.data.boqId,
    category_id: categoryId,
    description: parsed.data.description,
    quantity: parsed.data.quantity,
    unit: parsed.data.unit,
    unit_rate: parsed.data.unitRate,
    notes: parsed.data.notes || null,
    sort_order: 100
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/boq");
  revalidatePath(`/boq/${parsed.data.boqId}`);
  redirect(`/boq/${parsed.data.boqId}`);
}

const updateItemSchema = z.object({
  itemId: z.string().min(1),
  boqId: z.string().min(1),
  description: z.string().min(2, "Description is required."),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative."),
  unit: z.enum(["m2", "ls", "mtr", "ps", "units"]),
  unitRate: z.coerce.number().min(0, "Rate cannot be negative."),
  notes: z.string().optional()
});

export async function updateBoqItem(_: BoqActionState, formData: FormData): Promise<BoqActionState> {
  const parsed = updateItemSchema.safeParse({
    itemId: formData.get("itemId"),
    boqId: formData.get("boqId"),
    description: formData.get("description"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
    unitRate: formData.get("unitRate"),
    notes: formData.get("notes") || undefined
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check item details." };
  }

  if (!isSupabaseConfigured()) {
    return { ok: true };
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("boq_items")
    .update({
      description: parsed.data.description,
      quantity: parsed.data.quantity,
      unit: parsed.data.unit,
      unit_rate: parsed.data.unitRate,
      notes: parsed.data.notes || null
    })
    .eq("id", parsed.data.itemId)
    .eq("owner_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/boq");
  revalidatePath(`/boq/${parsed.data.boqId}`);
  return { ok: true };
}

export async function deleteBoqItem(_: BoqActionState, formData: FormData): Promise<BoqActionState> {
  const itemId = String(formData.get("itemId") ?? "");
  const boqId = String(formData.get("boqId") ?? "");

  if (!itemId || !boqId) {
    return { ok: false, error: "Missing item or BOQ ID." };
  }

  if (!isSupabaseConfigured()) {
    return { ok: true };
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("boq_items")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", itemId)
    .eq("owner_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/boq");
  revalidatePath(`/boq/${boqId}`);
  return { ok: true };
}

export async function importBoqItems(_: BoqActionState, formData: FormData): Promise<BoqActionState> {
  const boqId = String(formData.get("boqId") ?? "");
  const file = formData.get("file");

  if (!boqId || !(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a BOQ spreadsheet file." };
  }

  let rows;
  try {
    rows = parseBoqCsv(await file.text());
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not read spreadsheet." };
  }

  if (!isSupabaseConfigured()) {
    redirect(`/boq/${boqId}`);
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: existingCategories, error: categoryLoadError } = await supabase
    .from("boq_categories")
    .select("id,name")
    .eq("owner_id", user.id)
    .eq("boq_id", boqId)
    .is("deleted_at", null);

  if (categoryLoadError) {
    return { ok: false, error: categoryLoadError.message };
  }

  const categoryMap = new Map((existingCategories ?? []).map((category) => [category.name.toLowerCase(), category.id]));

  for (const row of rows) {
    if (!row.categoryName || categoryMap.has(row.categoryName.toLowerCase())) {
      continue;
    }

    const { data: category, error } = await supabase
      .from("boq_categories")
      .insert({
        owner_id: user.id,
        boq_id: boqId,
        name: row.categoryName,
        sort_order: 100 + categoryMap.size
      })
      .select("id")
      .single();

    if (error || !category) {
      return { ok: false, error: error?.message ?? "Could not create category." };
    }

    categoryMap.set(row.categoryName.toLowerCase(), category.id);
  }

  const { error } = await supabase.from("boq_items").insert(
    rows.map((row, index) => ({
      owner_id: user.id,
      boq_id: boqId,
      category_id: row.categoryName ? categoryMap.get(row.categoryName.toLowerCase()) ?? null : null,
      description: row.description,
      quantity: row.quantity,
      unit: row.unit,
      unit_rate: row.unitRate,
      notes: row.notes ?? null,
      sort_order: 200 + index
    }))
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/boq");
  revalidatePath(`/boq/${boqId}`);
  redirect(`/boq/${boqId}`);
}
