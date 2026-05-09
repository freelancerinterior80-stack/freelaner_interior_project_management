"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { createProject } from "@/features/projects/actions";
import { projectFormSchema, type ProjectFormValues } from "@/features/projects/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const projectTypes = [
  ["fit_out", "Fit-out"],
  ["interior_design", "Interior design"],
  ["construction", "Construction"],
  ["furniture", "Furniture"],
  ["renovation", "Renovation"],
  ["contracting", "Contracting"],
  ["other", "Other"]
] as const;

export function ProjectForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      type: "fit_out",
      status: "active",
      budget: 0
    }
  });

  function onSubmit(values: ProjectFormValues) {
    startTransition(async () => {
      const result = await createProject(values);
      if (!result.ok && result.error) {
        setError("root", { message: result.error });
      }
    });
  }

  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Project name</Label>
            <Input id="name" placeholder="Villa Fit-out" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client name</Label>
              <Input id="clientName" placeholder="Client name" {...register("clientName")} />
              {errors.clientName ? (
                <p className="text-sm text-destructive">{errors.clientName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientPhone">Client phone</Label>
              <Input id="clientPhone" placeholder="+9665xxxxxxx" {...register("clientPhone")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteLocation">Site location</Label>
            <Input id="siteLocation" placeholder="Riyadh, Olaya" {...register("siteLocation")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Project type</Label>
              <select
                id="type"
                className="h-12 w-full rounded-md border border-input bg-card px-3 text-base"
                {...register("type")}
              >
                {projectTypes.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                inputMode="decimal"
                {...register("budget", { valueAsNumber: true })}
              />
              {errors.budget ? (
                <p className="text-sm text-destructive">{errors.budget.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End date</Label>
              <Input id="endDate" type="date" {...register("endDate")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              rows={4}
              className="w-full rounded-md border border-input bg-card px-3 py-3 text-base"
              placeholder="Optional project notes"
              {...register("notes")}
            />
          </div>

          {errors.root ? <p className="text-sm text-destructive">{errors.root.message}</p> : null}

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={pending}>
              <Save className="h-4 w-4" />
              {pending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
