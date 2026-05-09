"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProgressFileKind } from "@/features/progress/types";

const progressSchema = z.object({
  projectId: z.string().min(1, "Choose a project."),
  progressPercent: z.coerce.number().min(0).max(100).optional(),
  updateDate: z.string().min(1, "Date is required."),
  note: z.string().optional()
});

export type ProgressActionState = {
  ok: boolean;
  error?: string;
};

export async function createProgressUpdate(_: ProgressActionState, formData: FormData): Promise<ProgressActionState> {
  const rawProgress = formData.get("progressPercent");
  const parsed = progressSchema.safeParse({
    projectId: formData.get("projectId"),
    progressPercent: rawProgress === "" || rawProgress === null ? undefined : rawProgress,
    updateDate: formData.get("updateDate"),
    note: formData.get("note") || undefined
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check progress details." };
  }

  if (!isSupabaseConfigured()) {
    redirect("/progress");
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: progress, error } = await supabase
    .from("progress_updates")
    .insert({
      owner_id: user.id,
      project_id: parsed.data.projectId,
      progress_percent: parsed.data.progressPercent ?? null,
      note: parsed.data.note || null,
      update_date: parsed.data.updateDate
    })
    .select("id")
    .single();

  if (error || !progress) {
    return { ok: false, error: error?.message ?? "Could not save progress." };
  }

  if (typeof parsed.data.progressPercent === "number") {
    await supabase
      .from("projects")
      .update({ progress_percent: parsed.data.progressPercent })
      .eq("owner_id", user.id)
      .eq("id", parsed.data.projectId);
  }

  const files = formData
    .getAll("media")
    .filter((file): file is File => file instanceof File && file.size > 0)
    .slice(0, 6);

  for (const file of files) {
    const storagePath = `${user.id}/progress/${progress.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("project-files").upload(storagePath, file, {
      contentType: file.type,
      upsert: false
    });

    if (uploadError) {
      return { ok: false, error: uploadError.message };
    }

    const { error: fileError } = await supabase.from("progress_files").insert({
      owner_id: user.id,
      progress_update_id: progress.id,
      kind: getFileKind(file),
      storage_path: storagePath,
      file_name: file.name,
      mime_type: file.type || null,
      size_bytes: file.size
    });

    if (fileError) {
      return { ok: false, error: fileError.message };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/progress");
  redirect("/progress");
}

function getFileKind(file: File): ProgressFileKind {
  if (file.type.startsWith("image/")) {
    return "image";
  }
  if (file.type.startsWith("video/")) {
    return "video";
  }
  if (file.type === "application/pdf") {
    return "pdf";
  }
  if (file.name.endsWith(".xls") || file.name.endsWith(".xlsx")) {
    return "excel";
  }
  return "other";
}
