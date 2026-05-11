"use client";

import { useTransition, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Save, Trash2 } from "lucide-react";
import { deleteProject, updateProject } from "@/features/projects/actions";
import { projectFormSchema, type ProjectFormValues } from "@/features/projects/schema";
import type { Project } from "@/features/projects/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

const projectTypes = [
  ["fit_out", "Fit-out"],
  ["interior_design", "Interior design"],
  ["construction", "Construction"],
  ["furniture", "Furniture"],
  ["renovation", "Renovation"],
  ["contracting", "Contracting"],
  ["other", "Other"]
] as const;

const projectStatuses = [
  ["lead", "Lead"],
  ["active", "Active"],
  ["on_hold", "On hold"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"]
] as const;

export function EditProjectSheet({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project.name,
      clientName: project.clientName,
      clientPhone: project.clientPhone ?? "",
      siteLocation: project.siteLocation ?? "",
      type: project.type as ProjectFormValues["type"],
      status: project.status,
      budget: project.budget,
      startDate: project.startDate ?? "",
      endDate: project.endDate ?? "",
      notes: project.notes ?? ""
    }
  });

  function onSubmit(values: ProjectFormValues) {
    startTransition(async () => {
      const result = await updateProject(project.id, values);
      if (result.ok) {
        setOpen(false);
      } else if (result.error) {
        setError("root", { message: result.error });
      }
    });
  }

  function onDelete() {
    startDeleteTransition(async () => {
      const result = await deleteProject(project.id);
      if (!result?.ok && result?.error) {
        setDeleteError(result.error);
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); setConfirmDelete(false); setDeleteError(null); }}>
      <SheetTrigger asChild>
        <Button variant="secondary" size="sm">
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-2xl pb-safe">
        <SheetHeader className="mb-4">
          <SheetTitle>Edit project</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Project name</Label>
            <Input id="edit-name" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-clientName">Client name</Label>
              <Input id="edit-clientName" {...register("clientName")} />
              {errors.clientName ? <p className="text-sm text-destructive">{errors.clientName.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-clientPhone">Client phone</Label>
              <Input id="edit-clientPhone" {...register("clientPhone")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-siteLocation">Site location</Label>
            <Input id="edit-siteLocation" {...register("siteLocation")} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type</Label>
              <select
                id="edit-type"
                className="h-12 w-full rounded-md border border-input bg-card px-3 text-base"
                {...register("type")}
              >
                {projectTypes.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                className="h-12 w-full rounded-md border border-input bg-card px-3 text-base"
                {...register("status")}
              >
                {projectStatuses.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-budget">Budget (KWD)</Label>
            <Input
              id="edit-budget"
              type="number"
              inputMode="decimal"
              {...register("budget", { valueAsNumber: true })}
            />
            {errors.budget ? <p className="text-sm text-destructive">{errors.budget.message}</p> : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-startDate">Start date</Label>
              <Input id="edit-startDate" type="date" {...register("startDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-endDate">End date</Label>
              <Input id="edit-endDate" type="date" {...register("endDate")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <textarea
              id="edit-notes"
              rows={3}
              className="w-full rounded-md border border-input bg-card px-3 py-3 text-base"
              {...register("notes")}
            />
          </div>

          {errors.root ? <p className="text-sm text-destructive">{errors.root.message}</p> : null}

          <Button type="submit" className="w-full" disabled={pending}>
            <Save className="h-4 w-4" />
            {pending ? "Saving..." : "Save changes"}
          </Button>
        </form>

        <div className="mt-4 border-t pt-4">
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex w-full items-center justify-center gap-2 rounded-md py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete project
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-center text-sm text-muted-foreground">
                Delete this project? All data linked to it will be removed. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  disabled={deletePending}
                  onClick={onDelete}
                >
                  {deletePending ? "Deleting..." : "Yes, delete"}
                </Button>
              </div>
              {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
