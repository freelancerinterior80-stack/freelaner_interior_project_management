export type ReportMetric = {
  label: string;
  value: number;
};

export type ReportProjectSummary = {
  id: string;
  name: string;
  clientName: string;
  progressPercent: number;
  budget: number;
  income: number;
  expense: number;
  profit: number;
};

export type ReportData = {
  generatedAt: string;
  totals: {
    income: number;
    expense: number;
    profit: number;
    activeProjects: number;
    pendingPayments: number;
    invoiceTotal: number;
    boqTotal: number;
    lowStockCount: number;
  };
  monthly: {
    month: string;
    income: number;
    expense: number;
    profit: number;
  }[];
  expenseByCategory: ReportMetric[];
  projectSummaries: ReportProjectSummary[];
  lowStockMaterials: {
    id: string;
    name: string;
    currentStock: number;
    threshold: number;
    supplierName?: string | null;
  }[];
  invoiceStatus: ReportMetric[];
  boq: {
    count: number;
    total: number;
  };
};
