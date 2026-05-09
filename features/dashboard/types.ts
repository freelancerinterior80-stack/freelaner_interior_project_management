import type { Project } from "@/features/projects/types";

export type DashboardData = {
  totals: {
    income: number;
    expense: number;
    profit: number;
    pendingPayments: number;
  };
  activeProjects: Project[];
  recentExpenses: {
    id: string;
    label: string;
    amount: number;
    date: string;
  }[];
  materialAlerts: {
    id: string;
    name: string;
    currentStock: number;
    threshold: number;
  }[];
  monthly: {
    month: string;
    income: number;
    expense: number;
  }[];
};
