"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";

const expenseSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount is required."),
  category: z.enum(["labor", "material", "transport", "furniture", "electrical", "miscellaneous", "sub_contractor"]),
  projectId: z.string().optional(),
  supplierName: z.string().optional(),
  expenseDate: z.string().min(1, "Date is required."),
  description: z.string().optional()
});

export type ExpenseActionState = {
  ok: boolean;
  error?: string;
};

export async function createExpense(_: ExpenseActionState, formData: FormData): Promise<ExpenseActionState> {
  const parsed = expenseSchema.safeParse({
    amount: formData.get("amount"),
    category: formData.get("category"),
    projectId: formData.get("projectId") || undefined,
    supplierName: formData.get("supplierName") || undefined,
    expenseDate: formData.get("expenseDate"),
    description: formData.get("description") || undefined
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check expense details." };
  }

  if (!isSupabaseConfigured()) {
    redirect("/expenses");
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  let supplierId: string | null = null;

  if (parsed.data.supplierName) {
    const { data: supplier, error: supplierError } = await supabase
      .from("suppliers")
      .insert({
        owner_id: user.id,
        name: parsed.data.supplierName
      })
      .select("id")
      .single();

    if (supplierError || !supplier) {
      return { ok: false, error: supplierError?.message ?? "Could not save supplier." };
    }

    supplierId = supplier.id;
  }

  const bill = formData.get("bill");
  let billFilePath: string | null = null;

  if (bill instanceof File && bill.size > 0) {
    const path = `${user.id}/expenses/${Date.now()}-${bill.name}`;
    const { error: uploadError } = await supabase.storage.from("project-files").upload(path, bill, {
      contentType: bill.type,
      upsert: false
    });

    if (uploadError) {
      return { ok: false, error: uploadError.message };
    }

    billFilePath = path;
  }

  const { error } = await supabase.from("expenses").insert({
    owner_id: user.id,
    project_id: parsed.data.projectId || null,
    supplier_id: supplierId,
    category: parsed.data.category,
    amount: parsed.data.amount,
    expense_date: parsed.data.expenseDate,
    description: parsed.data.description || null,
    bill_file_path: billFilePath
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  revalidatePath("/projects");
  redirect("/expenses");
}

export async function deleteExpense(formData: FormData) {
  const expenseId = String(formData.get("id") ?? "");
  if (!expenseId || !isSupabaseConfigured()) {
    revalidatePath("/expenses");
    redirect("/expenses");
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId)
    .eq("owner_id", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  revalidatePath("/projects");
  redirect("/expenses");
}
