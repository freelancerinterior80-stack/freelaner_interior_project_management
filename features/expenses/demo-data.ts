import type { Expense } from "@/features/expenses/types";

export const demoExpenses: Expense[] = [
  {
    id: "demo-exp-1",
    projectId: "demo-villa-fit-out",
    projectName: "Villa Fit-out",
    supplierName: "Al Noor Materials",
    category: "material",
    amount: 2450,
    expenseDate: "2026-05-08",
    description: "Gypsum boards and framing"
  },
  {
    id: "demo-exp-2",
    projectId: "demo-villa-fit-out",
    projectName: "Villa Fit-out",
    category: "labor",
    amount: 1800,
    expenseDate: "2026-05-07",
    description: "Ceiling labor team"
  },
  {
    id: "demo-exp-3",
    projectId: "demo-office-interior",
    projectName: "Office Interior",
    category: "transport",
    amount: 350,
    expenseDate: "2026-05-06",
    description: "Material transport"
  }
];
