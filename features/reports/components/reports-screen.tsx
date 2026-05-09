import Link from "next/link";
import type { Route } from "next";
import { AlertTriangle, Download, FileText, FolderKanban, PackageSearch, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatMoney } from "@/lib/utils";
import { ReportsChart } from "@/features/reports/components/reports-chart";
import type { ReportData, ReportMetric } from "@/features/reports/types";

export function ReportsScreen({ data }: { data: ReportData }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-wood-700">Reports</p>
          <h1 className="text-2xl font-semibold text-charcoal-900">Business snapshot</h1>
          <p className="mt-1 text-sm text-muted-foreground">Updated {formatDate(data.generatedAt)}</p>
        </div>
        <Button asChild size="sm">
          <Link href={"/api/exports/report" as Route} target="_blank">
            <Download className="h-4 w-4" />
            PDF
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Income" value={formatMoney(data.totals.income)} />
        <MetricCard label="Expense" value={formatMoney(data.totals.expense)} />
        <MetricCard label="Profit" value={formatMoney(data.totals.profit)} strong />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Monthly income vs expense</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportsChart data={data.monthly} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Quick totals</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <MiniStat icon={FolderKanban} label="Active projects" value={`${data.totals.activeProjects}`} />
            <MiniStat icon={WalletCards} label="Pending" value={formatMoney(data.totals.pendingPayments)} />
            <MiniStat icon={FileText} label="Invoices" value={formatMoney(data.totals.invoiceTotal)} />
            <MiniStat icon={PackageSearch} label="Low stock" value={`${data.totals.lowStockCount}`} />
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold text-charcoal-900">Project profit</h2>
        <div className="space-y-3">
          {data.projectSummaries.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}` as Route}>
              <Card className="border-0 shadow-soft">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-charcoal-900">{project.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{project.clientName}</p>
                    </div>
                    <Badge variant={project.profit >= 0 ? "success" : "warning"}>{formatMoney(project.profit)}</Badge>
                  </div>
                  <Progress value={project.progressPercent} />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <SmallValue label="Income" value={formatMoney(project.income)} />
                    <SmallValue label="Expense" value={formatMoney(project.expense)} />
                    <SmallValue label="Budget" value={formatMoney(project.budget)} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <MetricList title="Expense categories" metrics={data.expenseByCategory} />
        <MetricList title="Invoice status" metrics={data.invoiceStatus} />
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Material alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.lowStockMaterials.map((material) => (
              <div key={material.id} className="flex items-center justify-between gap-3 rounded-md bg-amber-50 p-3 text-sm">
                <div className="flex gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-700" />
                  <div>
                    <p className="font-medium text-charcoal-900">{material.name}</p>
                    <p className="text-muted-foreground">{material.supplierName ?? "No supplier"}</p>
                  </div>
                </div>
                <span className="font-semibold text-amber-900">
                  {material.currentStock}/{material.threshold}
                </span>
              </div>
            ))}
            {data.lowStockMaterials.length === 0 ? <p className="text-sm text-muted-foreground">No low stock items.</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-2 text-sm font-semibold sm:text-lg ${strong ? "text-charcoal-900" : "text-wood-700"}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary p-3">
      <Icon className="h-5 w-5 text-wood-700" />
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-charcoal-900">{value}</p>
    </div>
  );
}

function SmallValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary px-2 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs font-semibold text-charcoal-900 sm:text-sm">{value}</p>
    </div>
  );
}

function MetricList({ title, metrics }: { title: string; metrics: ReportMetric[] }) {
  return (
    <Card className="border-0 shadow-soft">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="capitalize text-muted-foreground">{metric.label.replace("_", " ")}</span>
            <span className="font-semibold text-charcoal-900">{formatMoney(metric.value)}</span>
          </div>
        ))}
        {metrics.length === 0 ? <p className="text-sm text-muted-foreground">No data yet.</p> : null}
      </CardContent>
    </Card>
  );
}
