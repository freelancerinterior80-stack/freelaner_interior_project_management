import Link from "next/link";
import type { Route } from "next";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";
import type { DocumentSummary } from "@/features/documents/types";

export function DocumentList({
  documents,
  basePath,
  emptyText
}: {
  documents: DocumentSummary[];
  basePath: "/quotations" | "/invoices";
  emptyText: string;
}) {
  if (documents.length === 0) {
    return (
      <Card className="border-0 shadow-soft">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">{emptyText}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((document) => (
        <Link key={document.id} href={`${basePath}/${document.id}` as Route}>
          <Card className="border-0 shadow-soft">
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-wood-700">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-charcoal-900">{document.number}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {document.projectName ?? "No project"} {document.clientName ? `- ${document.clientName}` : ""}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatMoney(document.total)}</p>
                <Badge variant="secondary" className="mt-2">
                  {document.status.replace("_", " ")}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
