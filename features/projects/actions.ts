"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { projectFormSchema, type ProjectFormValues } from "@/features/projects/schema";

export type ProjectActionState = {
  ok: boolean;
  error?: string;
};

export async function createProject(values: ProjectFormValues): Promise<ProjectActionState> {
  const parsed = projectFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the project details."
    };
  }

  if (!isSupabaseConfigured()) {
    revalidatePath("/projects");
    redirect("/projects");
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({
      owner_id: user.id,
      name: parsed.data.clientName,
      phone: parsed.data.clientPhone || null
    })
    .select("id")
    .single();

  if (clientError || !client) {
    return { ok: false, error: clientError?.message ?? "Could not create the client." };
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      owner_id: user.id,
      client_id: client.id,
      name: parsed.data.name,
      site_location: parsed.data.siteLocation || null,
      type: parsed.data.type,
      status: parsed.data.status,
      budget: parsed.data.budget,
      start_date: parsed.data.startDate || null,
      end_date: parsed.data.endDate || null,
      notes: parsed.data.notes || null
    })
    .select("id")
    .single();

  if (projectError || !project) {
    return { ok: false, error: projectError?.message ?? "Could not create the project." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}
