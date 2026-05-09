import { getBoqSummaries } from "@/features/boq/queries";
import { getInvoiceSummaries } from "@/features/documents/queries";
import { getExpenses } from "@/features/expenses/queries";
import { getMaterials } from "@/features/materials/queries";
import { getPayments } from "@/features/payments/queries";
import { getProjects } from "@/features/projects/queries";
import type { ReportData, ReportMetric } from "@/features/reports/types";

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getReportData(): Promise<ReportData> {
  const [projects, expenses, materials, payments, boqs, invoices] = await Promise.all([
    getProjects(),
    getExpenses(),
    getMaterials(),
    getPayments(),
    getBoqSummaries(),
    getInvoiceSummaries()
  ]);

  const completedIncome = payments
    .filter((payment) => payment.direction === "client_in" && payment.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const directExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const supplierExpense = payments
    .filter((payment) => payment.direction === "supplier_out" && payment.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const totalExpense = directExpense + supplierExpense;
  const lowStockMaterials = materials
    .filter((material) => material.currentStock <= material.lowStockThreshold)
    .map((material) => ({
      id: material.id,
      name: material.name,
      currentStock: material.currentStock,
      threshold: material.lowStockThreshold,
      supplierName: material.supplierName
    }));

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      income: completedIncome,
      expense: totalExpense,
      profit: completedIncome - totalExpense,
      activeProjects: projects.filter((project) => project.status === "active").length,
      pendingPayments: payments
        .filter((payment) => payment.status === "pending")
        .reduce((sum, payment) => sum + payment.amount, 0),
      invoiceTotal: invoices.reduce((sum, invoice) => sum + invoice.total, 0),
      boqTotal: boqs.reduce((sum, boq) => sum + boq.subtotal, 0),
      lowStockCount: lowStockMaterials.length
    },
    monthly: buildMonthly(expenses, payments),
    expenseByCategory: toMetrics(
      expenses.reduce<Record<string, number>>((acc, expense) => {
        const label = expense.category.replace("_", " ");
        acc[label] = (acc[label] ?? 0) + expense.amount;
        return acc;
      }, {})
    ),
    projectSummaries: projects.map((project) => ({
      id: project.id,
      name: project.name,
      clientName: project.clientName,
      progressPercent: project.progressPercent,
      budget: project.budget,
      income: project.totalIncome,
      expense: project.totalExpense,
      profit: project.netProfit
    })),
    lowStockMaterials,
    invoiceStatus: toMetrics(
      invoices.reduce<Record<string, number>>((acc, invoice) => {
        acc[invoice.status] = (acc[invoice.status] ?? 0) + invoice.total;
        return acc;
      }, {})
    ),
    boq: {
      count: boqs.length,
      total: boqs.reduce((sum, boq) => sum + boq.subtotal, 0)
    }
  };
}

function buildMonthly(
  expenses: { amount: number; expenseDate: string }[],
  payments: { amount: number; direction: string; status: string; paymentDate: string }[]
) {
  const rows = monthLabels.map((month) => ({ month, income: 0, expense: 0, profit: 0 }));

  payments.forEach((payment) => {
    if (payment.status !== "completed") {
      return;
    }
    const month = new Date(payment.paymentDate).getMonth();
    if (payment.direction === "client_in") {
      rows[month].income += payment.amount;
    }
    if (payment.direction === "supplier_out") {
      rows[month].expense += payment.amount;
    }
  });

  expenses.forEach((expense) => {
    rows[new Date(expense.expenseDate).getMonth()].expense += expense.amount;
  });

  return rows
    .map((row) => ({ ...row, profit: row.income - row.expense }))
    .filter((row) => row.income > 0 || row.expense > 0)
    .slice(-6);
}

function toMetrics(values: Record<string, number>): ReportMetric[] {
  return Object.entries(values)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}
