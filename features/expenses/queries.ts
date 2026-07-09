import { isSupabaseConfigured } from "@/lib/supabase/config";
import { requireUser } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { assertNoQueryError } from "@/lib/supabase/query-error";
import { demoExpenses } from "@/features/expenses/demo-data";
import type { Expense } from "@/features/expenses/types";

type ExpenseRow = {
  id: string;
  project_id: string | null;
  supplier_id: string | null;
  category: Expense["category"];
  amount: number | string;
  expense_date: string;
  description: string | null;
  bill_file_path: string | null;
  projects: { name: string } | null;
  suppliers: { name: string } | null;
};

export async function getExpenses(): Promise<Expense[]> {
  if (!isSupabaseConfigured()) {
    return demoExpenses;
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("id,project_id,supplier_id,category,amount,expense_date,description,bill_file_path,projects(name),suppliers(name)")
    .eq("owner_id", user.id)
    .is("deleted_at", null)
    .order("expense_date", { ascending: false });

  assertNoQueryError(error, "expenses");

  return ((data ?? []) as unknown as ExpenseRow[]).map((row) => ({
    id: row.id,
    projectId: row.project_id,
    projectName: row.projects?.name,
    supplierId: row.supplier_id,
    supplierName: row.suppliers?.name,
    category: row.category,
    amount: Number(row.amount),
    expenseDate: row.expense_date,
    description: row.description,
    billFilePath: row.bill_file_path
  }));
}
