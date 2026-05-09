"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { createBoq, type BoqActionState } from "@/features/boq/actions";
import type { ProjectOption } from "@/features/boq/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: BoqActionState = { ok: false };

export function BoqCreateForm({ projects }: { projects: ProjectOption[] }) {
  const [state, action, pending] = useActionState(createBoq, initialState);

  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="p-4">
        <form action={action} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">BOQ name</Label>
            <Input id="name" name="name" placeholder="Villa Fit-out BOQ" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectId">Project</Label>
            <select
              id="projectId"
              name="projectId"
              className="h-12 w-full rounded-md border border-input bg-card px-3 text-base"
            >
              <option value="">No project / template</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} - {project.clientName}
                </option>
              ))}
            </select>
          </div>
          <label className="flex min-h-12 items-center gap-3 rounded-md bg-secondary px-3 text-sm font-medium">
            <input type="checkbox" name="isTemplate" className="h-5 w-5 accent-primary" />
            Save as reusable template
          </label>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button className="w-full" disabled={pending}>
            <Save className="h-4 w-4" />
            {pending ? "Creating..." : "Create BOQ"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
