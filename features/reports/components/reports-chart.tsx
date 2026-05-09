"use client";

import dynamic from "next/dynamic";
import type { ReportData } from "@/features/reports/types";

const ReportsChartContent = dynamic(
  () => import("@/features/reports/components/reports-chart-content").then((mod) => mod.ReportsChartContent),
  {
    ssr: false,
    loading: () => <div className="h-56 w-full rounded-md bg-secondary" />
  }
);

export function ReportsChart({ data }: { data: ReportData["monthly"] }) {
  return <ReportsChartContent data={data} />;
}
