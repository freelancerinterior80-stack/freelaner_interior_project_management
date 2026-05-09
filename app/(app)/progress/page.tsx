import { ProgressScreen } from "@/features/progress/components/progress-screen";
import { getProgressProjectOptions, getProgressUpdates } from "@/features/progress/queries";

export default async function ProgressPage({
  searchParams
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const [{ projectId }, projects, updates] = await Promise.all([
    searchParams,
    getProgressProjectOptions(),
    getProgressUpdates()
  ]);

  return <ProgressScreen projects={projects} updates={updates} selectedProjectId={projectId} />;
}
