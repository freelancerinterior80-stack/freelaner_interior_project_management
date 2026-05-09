"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export function DashboardChartContent({
  data
}: {
  data: { month: string; income: number; expense: number }[];
}) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: "rgba(168, 117, 56, 0.08)" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2d7c6",
              boxShadow: "0 20px 60px -35px rgba(23,23,23,0.35)"
            }}
          />
          <Bar dataKey="income" fill="#2f6f4f" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expense" fill="#a87538" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
