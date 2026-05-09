"use client";

import dynamic from "next/dynamic";

const DashboardChartContent = dynamic(
  () =>
    import("@/features/dashboard/components/dashboard-chart-content").then(
      (mod) => mod.DashboardChartContent
    ),
  {
    ssr: false,
    loading: () => <div className="h-48 w-full rounded-md bg-secondary" />
  }
);

export function DashboardChart({
  data
}: {
  data: { month: string; income: number; expense: number }[];
}) {
  return <DashboardChartContent data={data} />;
}
