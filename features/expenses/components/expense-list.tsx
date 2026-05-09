import { Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatMoney } from "@/lib/utils";
import type { Expense } from "@/features/expenses/types";

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  if (expenses.length === 0) {
    return (
      <Card className="border-0 shadow-soft">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No expenses yet. Add the first site cost from your phone.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <Card key={expense.id} className="border-0 shadow-soft">
          <CardContent className="flex items-start justify-between gap-3 p-4">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-wood-700">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-charcoal-900">{expense.description || "Expense"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {expense.projectName ?? "No project"} - {formatDate(expense.expenseDate)}
                </p>
                <Badge variant="secondary" className="mt-2">
                  {expense.category.replace("_", " ")}
                </Badge>
              </div>
            </div>
            <p className="shrink-0 text-sm font-semibold text-charcoal-900">{formatMoney(expense.amount)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
