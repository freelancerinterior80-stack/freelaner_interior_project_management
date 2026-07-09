import { getProjectOptions } from "@/features/boq/queries";
import { demoProgressUpdates } from "@/features/progress/demo-data";
import type { ProgressFile, ProgressUpdate } from "@/features/progress/types";
import { requireUser } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { assertNoQueryError } from "@/lib/supabase/query-error";

type ProgressRow = {
  id: string;
  project_id: string;
  progress_percent: number | null;
  note: string | null;
  update_date: string;
  projects: { name: string; clients: { name: string } | { name: string }[] | null } | null;
  progress_files: {
    id: string;
    kind: ProgressFile["kind"];
    storage_path: string;
    file_name: string;
    mime_type: string | null;
    size_bytes: number | string | null;
  }[];
};

export async function getProgressUpdates(): Promise<ProgressUpdate[]> {
  if (!isSupabaseConfigured()) {
    return demoProgressUpdates;
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("progress_updates")
    .select(
      "id,project_id,progress_percent,note,update_date,projects(name,clients(name)),progress_files(id,kind,storage_path,file_name,mime_type,size_bytes)"
    )
    .eq("owner_id", user.id)
    .is("deleted_at", null)
    .order("update_date", { ascending: false })
    .limit(30);

  assertNoQueryError(error, "progress updates");

  return Promise.all(((data ?? []) as unknown as ProgressRow[]).map(mapProgressRow));
}

export async function getProgressProjectOptions() {
  return getProjectOptions();
}

async function mapProgressRow(row: ProgressRow): Promise<ProgressUpdate> {
  const client = Array.isArray(row.projects?.clients) ? row.projects?.clients[0] : row.projects?.clients;

  return {
    id: row.id,
    projectId: row.project_id,
    projectName: row.projects?.name ?? "Project",
    clientName: client?.name,
    progressPercent: row.progress_percent,
    note: row.note,
    updateDate: row.update_date,
    files: await Promise.all((row.progress_files ?? []).map(mapFileRow))
  };
}

async function mapFileRow(row: ProgressRow["progress_files"][number]): Promise<ProgressFile> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage.from("project-files").createSignedUrl(row.storage_path, 60 * 60);

  if (error) {
    console.error(`[supabase] progress file signed URL (${row.storage_path}) failed:`, error);
  }

  return {
    id: row.id,
    kind: row.kind,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes === null ? null : Number(row.size_bytes),
    storagePath: row.storage_path,
    url: data?.signedUrl ?? null
  };
}
