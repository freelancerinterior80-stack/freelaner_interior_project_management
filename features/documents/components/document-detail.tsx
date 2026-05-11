import Link from "next/link";
import { Download, ReceiptText } from "lucide-react";
import type { Route } from "next";
import { CreateInvoiceSheet } from "@/features/documents/components/create-invoice-sheet";
import { RecordPaymentSheet } from "@/features/documents/components/record-payment-sheet";
import { SharePdfButton } from "@/features/documents/components/share-pdf-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatMoney } from "@/lib/utils";
import type { Invoice, Quotation } from "@/features/documents/types";

type Props =
  | {
      kind: "quotation";
      document: Quotation;
    }
  | {
      kind: "invoice";
      document: Invoice;
    };

export function DocumentDetail(props: Props) {
  const { document, kind } = props;
  const number = kind === "quotation" ? document.quotationNumber : document.invoiceNumber;
  const exportPath = `/api/exports/${kind}/${document.id}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-wood-700">{document.projectName ?? "Document"}</p>
          <h1 className="text-2xl font-semibold text-charcoal-900">{number}</h1>
          {document.clientName ? <p className="mt-1 text-sm text-muted-foreground">{document.clientName}</p> : null}
        </div>
        <Badge variant={statusVariant(document.status)}>{document.status.replace("_", " ")}</Badge>
      </div>

      <Card className="border-0 shadow-soft">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-3xl font-semibold text-charcoal-900">{formatMoney(document.total)}</p>
            </div>
            <ReceiptText className="h-10 w-10 text-wood-700" />
          </div>
          <Totals document={document} />
          <div className="grid grid-cols-2 gap-3">
            <Button asChild variant="secondary">
              <Link href={exportPath as Route} target="_blank">
                <Download className="h-4 w-4" />
                PDF (EN)
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={`${exportPath}?lang=ar` as Route} target="_blank">
                <Download className="h-4 w-4" />
                PDF (عربي)
              </Link>
            </Button>
          </div>
          <SharePdfButton exportPath={exportPath} number={number} kind={kind} appUrl={appUrl} />
          {kind === "quotation" ? (
            <CreateInvoiceSheet
              quotationId={document.id}
              subtotal={document.subtotal}
              discountAmount={document.discountAmount}
              vatRate={document.vatRate}
              total={document.total}
            />
          ) : null}
          {kind === "invoice" && !["paid", "cancelled"].includes(document.status) && document.balanceDue > 0 ? (
            <RecordPaymentSheet invoiceId={document.id} balanceDue={document.balanceDue} />
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-soft">
        <CardContent className="space-y-2 p-4 text-sm">
          <Row label="Date" value={formatDate(document.issueDate)} />
          {kind === "quotation" && document.validUntil ? (
            <Row label="Valid until" value={formatDate(document.validUntil)} />
          ) : null}
          {kind === "invoice" && document.dueDate ? (
            <Row label="Due date" value={formatDate(document.dueDate)} />
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-soft">
        <CardContent className="space-y-3 p-4">
          <h2 className="font-semibold text-charcoal-900">Items</h2>
          {document.items.map((item) => (
            <div key={item.id} className="rounded-md bg-secondary p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-charcoal-900">{item.description}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.quantity} {item.unit.toUpperCase()} x {formatMoney(item.unitRate)}
                  </p>
                </div>
                <p className="text-sm font-semibold">{formatMoney(item.total)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {document.termsEn || document.termsAr ? (
        <Card className="border-0 shadow-soft">
          <CardContent className="space-y-3 p-4">
            <h2 className="font-semibold text-charcoal-900">Terms</h2>
            {document.termsEn ? <p className="text-sm leading-6 text-muted-foreground">{document.termsEn}</p> : null}
            {document.termsAr ? (
              <p dir="rtl" className="text-sm leading-6 text-muted-foreground">
                {document.termsAr}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Totals({ document }: { document: Quotation | Invoice }) {
  const isInvoice = "balanceDue" in document;
  const inv = isInvoice ? document : null;

  return (
    <div className="space-y-2 rounded-md bg-secondary p-3 text-sm">
      <Row label="Subtotal" value={formatMoney(document.subtotal)} />
      {document.discountAmount > 0 ? (
        <Row label="Discount" value={`- ${formatMoney(document.discountAmount)}`} />
      ) : null}

      {inv && inv.depositAmount > 0 && inv.paidAmount === 0 ? (
        <>
          <div className="my-1 border-t border-border" />
          <Row label="First payment due" value={formatMoney(inv.depositAmount)} bold />
          <Row label="Balance on completion" value={formatMoney(inv.total - inv.depositAmount)} />
        </>
      ) : null}

      {inv && inv.paidAmount > 0 ? (
        <>
          <div className="my-1 border-t border-border" />
          <Row label="Paid" value={formatMoney(inv.paidAmount)} />
          <Row label="Balance due" value={formatMoney(inv.balanceDue)} bold />
        </>
      ) : null}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-semibold text-charcoal-900" : "font-medium text-charcoal-900"}>{value}</span>
    </div>
  );
}

function statusVariant(status: string): "success" | "warning" | "secondary" | "outline" {
  if (["accepted", "paid"].includes(status)) return "success";
  if (["rejected", "cancelled", "overdue"].includes(status)) return "warning";
  if (["issued", "sent", "part_paid"].includes(status)) return "outline";
  return "secondary";
}
