import Link from "next/link";
import type { Route } from "next";
import { AlertTriangle, ClipboardList, Plus, Receipt, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatMoney } from "@/lib/utils";
import { DashboardChart } from "@/features/dashboard/components/dashboard-chart";
import type { DashboardData } from "@/features/dashboard/types";

const quickActions = [
  { href: "/projects/new", label: "Project", icon: Plus },
  { href: "/boq", label: "BOQ", icon: ClipboardList },
  { href: "/money", label: "Expense", icon: Receipt },
  { href: "/money", label: "Payment", icon: WalletCards }
];

export function DashboardScreen({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-wood-700">Today</p>
        <h1 className="text-2xl font-semibold text-charcoal-900">Owner dashboard</h1>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Income" value={formatMoney(data.totals.income)} tone="green" />
        <MetricCard label="Expense" value={formatMoney(data.totals.expense)} tone="wood" />
        <MetricCard label="Profit" value={formatMoney(data.totals.profit)} tone="dark" />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {quickActions.map((action) => (
          <Button key={action.label} asChild variant="secondary" className="h-20 flex-col px-2">
            <Link href={action.href as Route}>
              <action.icon className="h-5 w-5" />
              <span className="text-xs">{action.label}</span>
            </Link>
          </Button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Monthly flow</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardChart data={data.monthly} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.totals.pendingPayments > 0 ? (
              <AttentionItem
                label="Pending payments"
                value={formatMoney(data.totals.pendingPayments)}
              />
            ) : null}
            {data.materialAlerts.map((material) => (
              <AttentionItem
                key={material.id}
                label={`Low stock: ${material.name}`}
                value={`${material.currentStock}/${material.threshold}`}
              />
            ))}
            {data.totals.pendingPayments === 0 && data.materialAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing urgent right now.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-charcoal-900">Active projects</h2>
          <Link href="/projects" className="text-sm font-medium text-wood-700">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {data.activeProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}` as Route}>
              <Card className="border-0 shadow-soft">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-charcoal-900">{project.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{project.clientName}</p>
                    </div>
                    <Badge variant="success">{project.progressPercent}%</Badge>
                  </div>
                  <Progress value={project.progressPercent} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle>Recent expenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.recentExpenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
                  <Receipt className="h-5 w-5 text-wood-700" />
                </div>
                <span className="font-medium text-charcoal-900">{expense.label}</span>
              </div>
              <span>{formatMoney(expense.amount)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "green" | "wood" | "dark";
}) {
  const toneClass =
    tone === "green" ? "text-emerald-700" : tone === "wood" ? "text-wood-700" : "text-charcoal-900";

  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-2 text-sm font-semibold sm:text-lg ${toneClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function AttentionItem({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-amber-50 p-3 text-sm">
      <div className="flex items-center gap-2 text-amber-900">
        <AlertTriangle className="h-4 w-4" />
        <span className="font-medium">{label}</span>
      </div>
      <span className="font-semibold text-amber-900">{value}</span>
    </div>
  );
}
