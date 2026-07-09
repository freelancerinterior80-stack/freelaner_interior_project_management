import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { assertNoQueryError } from "@/lib/supabase/query-error";
import { requireUser } from "@/lib/auth/guards";
import { demoProjects } from "@/features/projects/demo-data";
import { demoExpenses } from "@/features/expenses/demo-data";
import { demoPayments } from "@/features/payments/demo-data";
import { getProjects } from "@/features/projects/queries";
import type { DashboardData } from "@/features/dashboard/types";

export async function getDashboardData(): Promise<DashboardData> {
  if (!isSupabaseConfigured()) {
    return getDemoDashboard();
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const projects = await getProjects();

  const [paymentsRes, recentExpensesRes, allExpensesRes, materialsRes, invoicesRes] = await Promise.all([
    supabase
      .from("payments")
      .select("amount,direction,status,payment_date")
      .eq("owner_id", user.id)
      .is("deleted_at", null),
    supabase
      .from("expenses")
      .select("id,amount,description,expense_date")
      .eq("owner_id", user.id)
      .is("deleted_at", null)
      .order("expense_date", { ascending: false })
      .limit(5),
    supabase
      .from("expenses")
      .select("amount,expense_date")
      .eq("owner_id", user.id)
      .is("deleted_at", null),
    supabase
      .from("materials")
      .select("id,name,current_stock,low_stock_threshold")
      .eq("owner_id", user.id)
      .is("deleted_at", null),
    supabase
      .from("invoices")
      .select("balance_due")
      .eq("owner_id", user.id)
      .is("deleted_at", null)
      .gt("balance_due", 0)
  ]);

  assertNoQueryError(paymentsRes.error, "dashboard payments");
  assertNoQueryError(recentExpensesRes.error, "dashboard recent expenses");
  assertNoQueryError(allExpensesRes.error, "dashboard expenses");
  assertNoQueryError(materialsRes.error, "dashboard materials");
  assertNoQueryError(invoicesRes.error, "dashboard outstanding invoices");

  const { data: payments } = paymentsRes;
  const { data: recentExpenses } = recentExpensesRes;
  const { data: allExpenses } = allExpensesRes;
  const { data: materials } = materialsRes;
  const { data: invoices } = invoicesRes;

  const completedPayments = payments?.filter((p) => p.status === "completed") ?? [];

  const income = completedPayments
    .filter((p) => p.direction === "client_in")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const supplierPayments = completedPayments
    .filter((p) => p.direction === "supplier_out")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const directExpense = allExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0;
  const expense = directExpense + supplierPayments;

  const outstandingInvoices = invoices?.reduce((sum, inv) => sum + Number(inv.balance_due), 0) ?? 0;

  // Only count client_in pending payments (money clients still owe us from manual records)
  const pendingPayments =
    payments
      ?.filter((p) => p.direction === "client_in" && p.status === "pending")
      .reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  return {
    totals: { income, expense, profit: income - expense, pendingPayments, outstandingInvoices },
    activeProjects: projects.filter((p) => p.status === "active").slice(0, 4),
    recentExpenses:
      recentExpenses?.map((e) => ({
        id: e.id,
        label: e.description || "Expense",
        amount: Number(e.amount),
        date: e.expense_date
      })) ?? [],
    materialAlerts:
      materials
        ?.filter((m) => Number(m.current_stock) <= Number(m.low_stock_threshold))
        .map((m) => ({
          id: m.id,
          name: m.name,
          currentStock: Number(m.current_stock),
          threshold: Number(m.low_stock_threshold)
        })) ?? [],
    monthly: buildMonthlyData(payments ?? [], allExpenses ?? [])
  };
}

function getDemoDashboard(): DashboardData {
  const income = demoPayments
    .filter((p) => p.direction === "client_in" && p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const expense =
    demoExpenses.reduce((sum, e) => sum + e.amount, 0) +
    demoPayments
      .filter((p) => p.direction === "supplier_out" && p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);

  const months = last6MonthNames();

  return {
    totals: {
      income,
      expense,
      profit: income - expense,
      pendingPayments: 18500,
      outstandingInvoices: 35000
    },
    activeProjects: demoProjects,
    recentExpenses: demoExpenses.map((e) => ({
      id: e.id,
      label: e.description || "Expense",
      amount: e.amount,
      date: e.expenseDate
    })),
    materialAlerts: [
      { id: "mat-1", name: "Plywood sheets", currentStock: 4, threshold: 8 },
      { id: "mat-2", name: "LED profiles", currentStock: 9, threshold: 10 }
    ],
    monthly: [
      { month: months[0], income: 38000, expense: 21000 },
      { month: months[1], income: 42000, expense: 26000 },
      { month: months[2], income: 53000, expense: 31000 },
      { month: months[3], income: 68000, expense: 41000 },
      { month: months[4], income: 45000, expense: 28000 },
      { month: months[5], income, expense }
    ]
  };
}

function last6MonthNames(): string[] {
  const now = new Date();
  const result: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(d.toLocaleString("en", { month: "short" }));
  }
  return result;
}

type PaymentRow = { amount: string | number; direction: string; status: string; payment_date: string };
type ExpenseRow = { amount: string | number; expense_date: string };

function buildMonthlyData(payments: PaymentRow[], expenses: ExpenseRow[]) {
  const now = new Date();
  const buckets: { month: string; key: string; income: number; expense: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      month: d.toLocaleString("en", { month: "short" }),
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      income: 0,
      expense: 0
    });
  }

  for (const p of payments) {
    if (p.status !== "completed") continue;
    const key = String(p.payment_date).slice(0, 7);
    const bucket = buckets.find((b) => b.key === key);
    if (!bucket) continue;
    if (p.direction === "client_in") bucket.income += Number(p.amount);
    else if (p.direction === "supplier_out") bucket.expense += Number(p.amount);
  }

  for (const e of expenses) {
    const key = String(e.expense_date).slice(0, 7);
    const bucket = buckets.find((b) => b.key === key);
    if (!bucket) continue;
    bucket.expense += Number(e.amount);
  }

  return buckets.map(({ month, income, expense }) => ({ month, income, expense }));
}
