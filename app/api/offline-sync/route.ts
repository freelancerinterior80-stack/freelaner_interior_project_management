import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const draftSchema = z.object({
  id: z.string(),
  kind: z.enum(["expense", "progress_update", "project_note", "boq_edit"]),
  payload: z.record(z.string(), z.unknown())
});

const expensePayloadSchema = z.object({
  amount: z.coerce.number().min(0.01),
  category: z.enum(["labor", "material", "transport", "furniture", "electrical", "miscellaneous"]),
  projectId: z.string().optional(),
  supplierName: z.string().optional(),
  expenseDate: z.string().min(1),
  description: z.string().optional()
});

const progressPayloadSchema = z.object({
  projectId: z.string().min(1),
  progressPercent: z.coerce.number().min(0).max(100).optional(),
  updateDate: z.string().min(1),
  note: z.string().optional()
});

export async function POST(request: Request) {
  const parsed = draftSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid offline draft." }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true });
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  if (parsed.data.kind === "expense") {
    const payload = expensePayloadSchema.safeParse(parsed.data.payload);
    if (!payload.success) {
      return NextResponse.json({ error: "Invalid expense draft." }, { status: 400 });
    }

    let supplierId: string | null = null;
    if (payload.data.supplierName) {
      const { data: supplier, error } = await supabase
        .from("suppliers")
        .insert({ owner_id: user.id, name: payload.data.supplierName })
        .select("id")
        .single();

      if (error || !supplier) {
        return NextResponse.json({ error: error?.message ?? "Could not save supplier." }, { status: 500 });
      }
      supplierId = supplier.id;
    }

    const { error } = await supabase.from("expenses").insert({
      owner_id: user.id,
      project_id: payload.data.projectId || null,
      supplier_id: supplierId,
      category: payload.data.category,
      amount: payload.data.amount,
      expense_date: payload.data.expenseDate,
      description: payload.data.description || null
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("offline_sync_entries").upsert({
      owner_id: user.id,
      client_temp_id: parsed.data.id,
      entity_type: "expense",
      operation: "insert",
      payload: parsed.data.payload,
      status: "synced"
    });

    revalidatePath("/dashboard");
    revalidatePath("/expenses");
    revalidatePath("/reports");
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.kind === "progress_update") {
    const payload = progressPayloadSchema.safeParse(parsed.data.payload);
    if (!payload.success) {
      return NextResponse.json({ error: "Invalid progress draft." }, { status: 400 });
    }

    const { error } = await supabase.from("progress_updates").insert({
      owner_id: user.id,
      project_id: payload.data.projectId,
      progress_percent: payload.data.progressPercent ?? null,
      update_date: payload.data.updateDate,
      note: payload.data.note || null
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (typeof payload.data.progressPercent === "number") {
      await supabase
        .from("projects")
        .update({ progress_percent: payload.data.progressPercent })
        .eq("owner_id", user.id)
        .eq("id", payload.data.projectId);
    }

    await supabase.from("offline_sync_entries").upsert({
      owner_id: user.id,
      client_temp_id: parsed.data.id,
      entity_type: "progress_update",
      operation: "insert",
      payload: parsed.data.payload,
      status: "synced"
    });

    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath("/progress");
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase.from("offline_sync_entries").upsert({
    owner_id: user.id,
    client_temp_id: parsed.data.id,
    entity_type: parsed.data.kind,
    operation: parsed.data.kind === "boq_edit" || parsed.data.kind === "project_note" ? "update" : "insert",
    payload: parsed.data.payload,
    status: "pending"
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
