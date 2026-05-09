import { Bell, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatMoney } from "@/lib/utils";
import type { Payment } from "@/features/payments/types";

export function PaymentList({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <Card className="border-0 shadow-soft">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No payments yet. Record client income or supplier payments here.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <Card key={payment.id} className="border-0 shadow-soft">
          <CardContent className="flex items-start justify-between gap-3 p-4">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-wood-700">
                <WalletCards className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-charcoal-900">
                  {payment.direction === "client_in" ? payment.clientName ?? "Client payment" : payment.supplierName ?? "Supplier payment"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {payment.projectName ?? payment.invoiceNumber ?? "No project"} - {formatDate(payment.paymentDate)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant={payment.status === "completed" ? "success" : "warning"}>
                    {payment.status.replace("_", " ")}
                  </Badge>
                  {payment.reminderAt ? (
                    <Badge variant="outline">
                      <Bell className="mr-1 h-3 w-3" />
                      reminder
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>
            <p className="shrink-0 text-sm font-semibold text-charcoal-900">{formatMoney(payment.amount)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
