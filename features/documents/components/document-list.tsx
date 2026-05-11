"use client";

import Link from "next/link";
import type { Route } from "next";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteRecordButton } from "@/components/delete-record-button";
import { deleteInvoice, deleteQuotation } from "@/features/documents/actions";
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
  const deleteAction = basePath === "/invoices" ? deleteInvoice : deleteQuotation;
  const label = basePath === "/invoices" ? "invoice" : "quotation";

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
        <div key={document.id} className="relative">
          <Link href={`${basePath}/${document.id}` as Route} className="block">
            <Card className="border-0 shadow-soft">
              <CardContent className="flex items-center justify-between gap-3 p-4 pr-12">
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
          <div className="absolute right-3 top-3 z-10">
            <DeleteRecordButton id={document.id} label={label} action={deleteAction} />
          </div>
        </div>
      ))}
    </div>
  );
}
