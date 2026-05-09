"use client";

import { useActionState, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProgressUpdate, type ProgressActionState } from "@/features/progress/actions";
import { useOfflineStore } from "@/features/offline/store";
import type { ProjectOption } from "@/features/boq/types";

const initialState: ProgressActionState = { ok: false };

export function ProgressForm({
  projects,
  selectedProjectId
}: {
  projects: ProjectOption[];
  selectedProjectId?: string;
}) {
  const [state, action, pending] = useActionState(createProgressUpdate, initialState);
  const addDraft = useOfflineStore((store) => store.addDraft);
  const [offlineSaved, setOfflineSaved] = useState(false);

  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="p-4">
        <form
          action={action}
          className="space-y-4"
          onSubmit={(event) => {
            if (navigator.onLine) {
              return;
            }

            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const projectId = String(formData.get("projectId") ?? "");
            const project = projects.find((item) => item.id === projectId);
            const note = String(formData.get("note") ?? "");

            addDraft({
              kind: "progress_update",
              label: project ? `${project.name} progress` : "Progress update",
              payload: {
                projectId,
                progressPercent: String(formData.get("progressPercent") ?? "") || undefined,
                updateDate: String(formData.get("updateDate") ?? ""),
                note: note || undefined
              }
            });
            setOfflineSaved(true);
            event.currentTarget.reset();
          }}
        >
          <h2 className="font-semibold text-charcoal-900">Add site update</h2>
          <div className="space-y-2">
            <Label htmlFor="projectId">Project</Label>
            <select
              id="projectId"
              name="projectId"
              defaultValue={selectedProjectId}
              className="h-12 w-full rounded-md border border-input bg-card px-3 text-base"
              required
            >
              <option value="">Choose project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} - {project.clientName}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="progressPercent">Progress %</Label>
              <Input id="progressPercent" name="progressPercent" type="number" min="0" max="100" inputMode="numeric" placeholder="65" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="updateDate">Date</Label>
              <Input id="updateDate" name="updateDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Site note</Label>
            <textarea
              id="note"
              name="note"
              rows={4}
              className="w-full rounded-md border border-input bg-card px-3 py-3 text-base"
              placeholder="What changed on site today?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="media">Photos or videos</Label>
            <Input id="media" name="media" type="file" accept="image/*,video/*" multiple />
            <p className="text-xs text-muted-foreground">Up to 6 files per update. Offline drafts save notes only.</p>
          </div>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {offlineSaved ? (
            <p className="rounded-md bg-secondary p-3 text-sm text-charcoal-700">
              Saved on this phone. It will sync when the connection returns.
            </p>
          ) : null}
          <Button className="w-full" disabled={pending}>
            <Camera className="h-4 w-4" />
            {pending ? "Saving..." : "Save update"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
