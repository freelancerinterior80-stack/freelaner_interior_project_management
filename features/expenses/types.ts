export type ExpenseCategory =
  | "labor"
  | "material"
  | "transport"
  | "furniture"
  | "electrical"
  | "miscellaneous";

export type Expense = {
  id: string;
  projectId?: string | null;
  projectName?: string | null;
  supplierId?: string | null;
  supplierName?: string | null;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  description?: string | null;
  billFilePath?: string | null;
};
