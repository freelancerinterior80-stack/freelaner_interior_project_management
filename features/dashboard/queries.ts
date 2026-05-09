import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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

  const [{ data: payments }, { data: recentExpenses }, { data: allExpenses }, { data: materials }] = await Promise.all([
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
      .select("amount")
      .eq("owner_id", user.id)
      .is("deleted_at", null),
    supabase
      .from("materials")
      .select("id,name,current_stock,low_stock_threshold")
      .eq("owner_id", user.id)
      .is("deleted_at", null)
  ]);

  const income =
    payments
      ?.filter((payment) => payment.direction === "client_in" && payment.status === "completed")
      .reduce((sum, payment) => sum + Number(payment.amount), 0) ?? 0;
  const directExpense = allExpenses?.reduce((sum, expenseRow) => sum + Number(expenseRow.amount), 0) ?? 0;
  const supplierPayments =
    payments
      ?.filter((payment) => payment.direction === "supplier_out" && payment.status === "completed")
      .reduce((sum, payment) => sum + Number(payment.amount), 0) ?? 0;
  const expense = directExpense + supplierPayments;

  return {
    totals: {
      income,
      expense,
      profit: income - expense,
      pendingPayments:
        payments
          ?.filter((payment) => payment.status === "pending")
          .reduce((sum, payment) => sum + Number(payment.amount), 0) ?? 0
    },
    activeProjects: projects.filter((project) => project.status === "active").slice(0, 4),
    recentExpenses:
      recentExpenses?.map((expenseRow) => ({
        id: expenseRow.id,
        label: expenseRow.description || "Expense",
        amount: Number(expenseRow.amount),
        date: expenseRow.expense_date
      })) ?? [],
    materialAlerts:
      materials
        ?.filter((material) => Number(material.current_stock) <= Number(material.low_stock_threshold))
        .map((material) => ({
          id: material.id,
          name: material.name,
          currentStock: Number(material.current_stock),
          threshold: Number(material.low_stock_threshold)
        })) ?? [],
    monthly: buildMonthlyData(income, expense)
  };
}

function getDemoDashboard(): DashboardData {
  const income = demoPayments
    .filter((payment) => payment.direction === "client_in" && payment.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const expense =
    demoExpenses.reduce((sum, expense) => sum + expense.amount, 0) +
    demoPayments
      .filter((payment) => payment.direction === "supplier_out" && payment.status === "completed")
      .reduce((sum, payment) => sum + payment.amount, 0);

  return {
    totals: {
      income,
      expense,
      profit: income - expense,
      pendingPayments: 18500
    },
    activeProjects: demoProjects,
    recentExpenses: demoExpenses.map((expense) => ({
      id: expense.id,
      label: expense.description || "Expense",
      amount: expense.amount,
      date: expense.expenseDate
    })),
    materialAlerts: [
      { id: "mat-1", name: "Plywood sheets", currentStock: 4, threshold: 8 },
      { id: "mat-2", name: "LED profiles", currentStock: 9, threshold: 10 }
    ],
    monthly: [
      { month: "Jan", income: 38000, expense: 21000 },
      { month: "Feb", income: 42000, expense: 26000 },
      { month: "Mar", income: 53000, expense: 31000 },
      { month: "Apr", income: 68000, expense: 41000 },
      { month: "May", income, expense }
    ]
  };
}

function buildMonthlyData(income: number, expense: number) {
  return [
    { month: "Jan", income: 0, expense: 0 },
    { month: "Feb", income: 0, expense: 0 },
    { month: "Mar", income: 0, expense: 0 },
    { month: "Apr", income: 0, expense: 0 },
    { month: "May", income, expense }
  ];
}
