import { ProjectForm } from "@/features/projects/components/project-form";

export default function NewProjectPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-wood-700">New project</p>
        <h1 className="text-2xl font-semibold text-charcoal-900">Start with basics</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          You can add BOQ, files, and expenses after saving.
        </p>
      </div>
      <ProjectForm />
    </div>
  );
}
