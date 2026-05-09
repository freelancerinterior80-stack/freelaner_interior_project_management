import type { Project } from "@/features/projects/types";

export const demoProjects: Project[] = [
  {
    id: "demo-villa-fit-out",
    name: "Villa Fit-out",
    clientName: "Ahmed Al Saud",
    clientPhone: "+966500000001",
    siteLocation: "Riyadh, Al Narjis",
    type: "fit_out",
    status: "active",
    budget: 120000,
    progressPercent: 65,
    startDate: "2026-04-01",
    endDate: "2026-06-15",
    notes: "Ceiling and flooring are in progress.",
    totalIncome: 54000,
    totalExpense: 35600,
    netProfit: 18400
  },
  {
    id: "demo-office-interior",
    name: "Office Interior",
    clientName: "Noura Studio",
    clientPhone: "+966500000002",
    siteLocation: "Riyadh, Olaya",
    type: "interior_design",
    status: "active",
    budget: 85000,
    progressPercent: 30,
    startDate: "2026-04-20",
    endDate: "2026-07-01",
    notes: "BOQ approval pending.",
    totalIncome: 25000,
    totalExpense: 12500,
    netProfit: 12500
  }
];
