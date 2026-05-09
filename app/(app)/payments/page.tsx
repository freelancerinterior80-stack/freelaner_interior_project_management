import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentList } from "@/features/payments/components/payment-list";
import { getPayments } from "@/features/payments/queries";

export default async function PaymentsPage() {
  const payments = await getPayments();

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-wood-700">Payments</p>
          <h1 className="text-2xl font-semibold text-charcoal-900">Money in and out</h1>
        </div>
        <Button asChild size="sm">
          <Link href="/payments/new">
            <Plus className="h-4 w-4" />
            Add
          </Link>
        </Button>
      </div>
      <PaymentList payments={payments} />
    </div>
  );
}
