import { notFound } from "next/navigation";
import { ProjectDetail } from "@/features/projects/components/project-detail";
import { getProjectById } from "@/features/projects/queries";

export default async function ProjectDetailPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  return <ProjectDetail project={project} />;
}
