import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseList } from "@/features/expenses/components/expense-list";
import { getExpenses } from "@/features/expenses/queries";

export default async function ExpensesPage() {
  const expenses = await getExpenses();

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-wood-700">Expenses</p>
          <h1 className="text-2xl font-semibold text-charcoal-900">Daily costs</h1>
        </div>
        <Button asChild size="sm">
          <Link href="/expenses/new">
            <Plus className="h-4 w-4" />
            Add
          </Link>
        </Button>
      </div>
      <ExpenseList expenses={expenses} />
    </div>
  );
}
