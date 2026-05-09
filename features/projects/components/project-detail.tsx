import Link from "next/link";
import type { Route } from "next";
import { Camera, ClipboardList, FileText, Receipt, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatMoney } from "@/lib/utils";
import type { Project } from "@/features/projects/types";

const actions = [
  { href: "/boq", label: "BOQ", icon: ClipboardList },
  { href: "/invoices", label: "Invoice", icon: FileText },
  { href: "/expenses/new", label: "Expense", icon: Receipt },
  { href: "/payments/new", label: "Payment", icon: WalletCards },
  { href: "/progress", label: "Progress", icon: Camera }
];

export function ProjectDetail({ project }: { project: Project }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-wood-700">{project.clientName}</p>
          <h1 className="text-2xl font-semibold text-charcoal-900">{project.name}</h1>
        </div>
        <Badge variant={project.status === "active" ? "success" : "secondary"}>
          {project.status.replace("_", " ")}
        </Badge>
      </div>

      <Card className="border-0 shadow-soft">
        <CardContent className="space-y-5 p-4">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{project.progressPercent}%</span>
            </div>
            <Progress value={project.progressPercent} />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Metric label="Budget" value={formatMoney(project.budget)} />
            <Metric label="Expense" value={formatMoney(project.totalExpense)} />
            <Metric label="Profit" value={formatMoney(project.netProfit)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {actions.map((action) => (
          <Button key={action.label} asChild variant="secondary" className="h-20 flex-col">
            <Link href={(action.label === "Progress" ? `/progress?projectId=${project.id}` : action.href) as Route}>
              <action.icon className="h-5 w-5" />
              {action.label}
            </Link>
          </Button>
        ))}
      </div>

      <Card className="border-0 shadow-soft">
        <CardContent className="space-y-4 p-4">
          <h2 className="font-semibold text-charcoal-900">Project details</h2>
          <DetailRow label="Location" value={project.siteLocation ?? "Not set"} />
          <DetailRow label="Type" value={project.type.replace("_", " ")} />
          <DetailRow label="Start" value={formatDate(project.startDate)} />
          <DetailRow label="End" value={formatDate(project.endDate)} />
          <DetailRow label="Client phone" value={project.clientPhone ?? "Not set"} />
          {project.notes ? (
            <div className="rounded-md bg-secondary p-3 text-sm leading-6 text-charcoal-700">
              {project.notes}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary px-2 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-charcoal-900">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-charcoal-900">{value}</span>
    </div>
  );
}
