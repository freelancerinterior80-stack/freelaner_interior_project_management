export type ProjectStatus = "lead" | "active" | "on_hold" | "completed" | "cancelled";

export type Project = {
  id: string;
  name: string;
  clientName: string;
  clientPhone?: string | null;
  siteLocation?: string | null;
  type: string;
  status: ProjectStatus;
  budget: number;
  progressPercent: number;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
};
