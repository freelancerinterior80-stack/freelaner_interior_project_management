import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatMoney } from "@/lib/utils";
import type { Project } from "@/features/projects/types";

export function ProjectList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <Card className="border-0 shadow-soft">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No projects yet. Tap New to add the first one.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <Link key={project.id} href={`/projects/${project.id}`}>
          <Card className="border-0 shadow-soft transition-transform active:scale-[0.99]">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-charcoal-900">{project.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{project.clientName}</p>
                </div>
                <Badge variant={project.status === "active" ? "success" : "secondary"}>
                  {project.status.replace("_", " ")}
                </Badge>
              </div>
              {project.siteLocation ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {project.siteLocation}
                </p>
              ) : null}
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{project.progressPercent}% complete</span>
                  <span className="font-medium">{formatMoney(project.netProfit)}</span>
                </div>
                <Progress value={project.progressPercent} />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
