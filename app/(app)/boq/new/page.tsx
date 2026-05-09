import { BoqCreateForm } from "@/features/boq/components/boq-create-form";
import { getProjectOptions } from "@/features/boq/queries";

export default async function NewBoqPage() {
  const projects = await getProjectOptions();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-wood-700">New BOQ</p>
        <h1 className="text-2xl font-semibold text-charcoal-900">Start simple</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Add categories and items after creating the BOQ.
        </p>
      </div>
      <BoqCreateForm projects={projects} />
    </div>
  );
}
