import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import { demoProjects } from "@/features/projects/demo-data";
import type { Project } from "@/features/projects/types";

type ProjectRow = {
  id: string;
  name: string;
  site_location: string | null;
  type: string;
  status: Project["status"];
  budget: number | string;
  progress_percent: number;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  clients: {
    name: string;
    phone: string | null;
  } | null | { name: string; phone: string | null }[];
};

export async function getProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured()) {
    return demoProjects;
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id,name,site_location,type,status,budget,progress_percent,start_date,end_date,notes,clients(name,phone)"
    )
    .eq("owner_id", user.id)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return demoProjects;
  }

  return Promise.all(((data as unknown) as ProjectRow[]).map(mapProjectRow));
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (!isSupabaseConfigured()) {
    return demoProjects.find((project) => project.id === id) ?? null;
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id,name,site_location,type,status,budget,progress_percent,start_date,end_date,notes,clients(name,phone)"
    )
    .eq("owner_id", user.id)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapProjectRow((data as unknown) as ProjectRow);
}

async function mapProjectRow(row: ProjectRow): Promise<Project> {
  const financials = await getProjectFinancials(row.id);

  const client = Array.isArray(row.clients) ? row.clients[0] : row.clients;

  return {
    id: row.id,
    name: row.name,
    clientName: client?.name ?? "No client",
    clientPhone: client?.phone,
    siteLocation: row.site_location,
    type: row.type,
    status: row.status,
    budget: Number(row.budget ?? 0),
    progressPercent: row.progress_percent,
    startDate: row.start_date,
    endDate: row.end_date,
    notes: row.notes,
    ...financials
  };
}

async function getProjectFinancials(projectId: string) {
  if (!isSupabaseConfigured()) {
    const demo = demoProjects.find((project) => project.id === projectId);
    return {
      totalIncome: demo?.totalIncome ?? 0,
      totalExpense: demo?.totalExpense ?? 0,
      netProfit: demo?.netProfit ?? 0
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("project_financial_summary")
    .select("total_income,total_expense,net_profit")
    .eq("project_id", projectId)
    .maybeSingle();

  return {
    totalIncome: Number(data?.total_income ?? 0),
    totalExpense: Number(data?.total_expense ?? 0),
    netProfit: Number(data?.net_profit ?? 0)
  };
}
