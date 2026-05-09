import { ExpenseForm } from "@/features/expenses/components/expense-form";
import { getProjectOptions } from "@/features/boq/queries";

export default async function NewExpensePage() {
  const projects = await getProjectOptions();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-wood-700">Quick expense</p>
        <h1 className="text-2xl font-semibold text-charcoal-900">Record a cost</h1>
      </div>
      <ExpenseForm projects={projects} />
    </div>
  );
}
