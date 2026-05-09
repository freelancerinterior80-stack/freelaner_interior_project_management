import { ProgressForm } from "@/features/progress/components/progress-form";
import { ProgressTimeline } from "@/features/progress/components/progress-timeline";
import type { ProjectOption } from "@/features/boq/types";
import type { ProgressUpdate } from "@/features/progress/types";

export function ProgressScreen({
  projects,
  updates,
  selectedProjectId
}: {
  projects: ProjectOption[];
  updates: ProgressUpdate[];
  selectedProjectId?: string;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-wood-700">Site progress</p>
        <h1 className="text-2xl font-semibold text-charcoal-900">Daily updates</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <ProgressForm projects={projects} selectedProjectId={selectedProjectId} />
        <section className="space-y-3">
          <h2 className="font-semibold text-charcoal-900">Timeline</h2>
          <ProgressTimeline updates={updates} />
        </section>
      </div>
    </div>
  );
}
