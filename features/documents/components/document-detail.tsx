import Link from "next/link";
import { Download, MessageCircle, ReceiptText } from "lucide-react";
import type { Route } from "next";
import { createInvoiceFromQuotation } from "@/features/documents/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";
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
  const shareText = `${kind === "quotation" ? "Quotation" : "Invoice"} ${number}: ${exportPath}`;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-wood-700">{document.projectName ?? "Document"}</p>
          <h1 className="text-2xl font-semibold text-charcoal-900">{number}</h1>
          {document.clientName ? <p className="mt-1 text-sm text-muted-foreground">{document.clientName}</p> : null}
        </div>
        <Badge variant="secondary">{document.status.replace("_", " ")}</Badge>
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
          <Button asChild variant="secondary" className="w-full">
            <Link href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}>
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Link>
          </Button>
          {kind === "quotation" ? (
            <form action={createInvoiceFromQuotation}>
              <input type="hidden" name="quotationId" value={document.id} />
              <Button className="w-full">Convert to invoice</Button>
            </form>
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
  return (
    <div className="space-y-2 rounded-md bg-secondary p-3 text-sm">
      <Row label="Subtotal" value={formatMoney(document.subtotal)} />
      <Row label="Discount" value={formatMoney(document.discountAmount)} />
      <Row label={`VAT ${Math.round(document.vatRate * 100)}%`} value={formatMoney(document.vatAmount)} />
      {"balanceDue" in document ? <Row label="Balance due" value={formatMoney(document.balanceDue)} /> : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-charcoal-900">{value}</span>
    </div>
  );
}
