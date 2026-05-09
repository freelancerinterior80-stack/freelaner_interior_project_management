import Link from "next/link";
import { FileText, Receipt, WalletCards } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const moneyItems = [
  {
    href: "/quotations",
    label: "Quotations",
    description: "Offers generated from BOQs",
    icon: FileText
  },
  {
    href: "/invoices",
    label: "Invoices",
    description: "Payment requests and balances",
    icon: WalletCards
  },
  {
    href: "/payments",
    label: "Payments",
    description: "Client and supplier payments",
    icon: WalletCards
  },
  {
    href: "/expenses",
    label: "Quick expenses",
    description: "Daily costs and bill photos",
    icon: Receipt
  }
];

export default function MoneyPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-wood-700">Money</p>
        <h1 className="text-2xl font-semibold text-charcoal-900">Cash movement</h1>
      </div>
      <div className="space-y-3">
        {moneyItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <Card className="border-0 shadow-soft">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-secondary text-wood-700">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-charcoal-900">{item.label}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
