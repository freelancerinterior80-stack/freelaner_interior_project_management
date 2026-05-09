import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import { getProjects } from "@/features/projects/queries";
import { demoBoqs, getDemoBoqSummaries } from "@/features/boq/demo-data";
import type { Boq, BoqCategory, BoqItem, BoqSummary, ProjectOption } from "@/features/boq/types";

type BoqRow = {
  id: string;
  name: string;
  project_id: string | null;
  is_template: boolean;
  subtotal: number | string;
  notes: string | null;
  projects: { name: string; clients: { name: string } | { name: string }[] | null } | null;
};

type CategoryRow = {
  id: string;
  name: string;
  sort_order: number;
};

type ItemRow = {
  id: string;
  category_id: string | null;
  description: string;
  quantity: number | string;
  unit: BoqItem["unit"];
  unit_rate: number | string;
  total: number | string;
  notes: string | null;
  sort_order: number;
};

export async function getBoqSummaries(): Promise<BoqSummary[]> {
  if (!isSupabaseConfigured()) {
    return getDemoBoqSummaries();
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("boqs")
    .select("id,name,project_id,is_template,subtotal,projects(name,clients(name))")
    .eq("owner_id", user.id)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return getDemoBoqSummaries();
  }

  return ((data as unknown) as BoqRow[]).map((row) => {
    const client = Array.isArray(row.projects?.clients)
      ? row.projects?.clients[0]
      : row.projects?.clients;

    return {
      id: row.id,
      name: row.name,
      projectId: row.project_id,
      projectName: row.projects?.name ?? null,
      clientName: client?.name ?? null,
      isTemplate: row.is_template,
      subtotal: Number(row.subtotal ?? 0),
      itemCount: 0
    };
  });
}

export async function getBoqById(id: string): Promise<Boq | null> {
  if (!isSupabaseConfigured()) {
    return demoBoqs.find((boq) => boq.id === id) ?? null;
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const [{ data: boq, error: boqError }, { data: categories }, { data: items }] = await Promise.all([
    supabase
      .from("boqs")
      .select("id,name,project_id,is_template,subtotal,notes,projects(name,clients(name))")
      .eq("owner_id", user.id)
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("boq_categories")
      .select("id,name,sort_order")
      .eq("owner_id", user.id)
      .eq("boq_id", id)
      .is("deleted_at", null)
      .order("sort_order"),
    supabase
      .from("boq_items")
      .select("id,category_id,description,quantity,unit,unit_rate,total,notes,sort_order")
      .eq("owner_id", user.id)
      .eq("boq_id", id)
      .is("deleted_at", null)
      .order("sort_order")
  ]);

  if (boqError || !boq) {
    return null;
  }

  return mapBoqRow(
    (boq as unknown) as BoqRow,
    ((categories ?? []) as unknown) as CategoryRow[],
    ((items ?? []) as unknown) as ItemRow[]
  );
}

export async function getProjectOptions(): Promise<ProjectOption[]> {
  const projects = await getProjects();
  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    clientName: project.clientName
  }));
}

function mapBoqRow(row: BoqRow, categoryRows: CategoryRow[], itemRows: ItemRow[]): Boq {
  const categories: BoqCategory[] = categoryRows.map((category) => ({
    id: category.id,
    name: category.name,
    sortOrder: category.sort_order,
    items: []
  }));
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const ungroupedItems: BoqItem[] = [];

  itemRows.forEach((itemRow) => {
    const item = mapItemRow(itemRow);
    if (item.categoryId && categoryMap.has(item.categoryId)) {
      categoryMap.get(item.categoryId)?.items.push(item);
    } else {
      ungroupedItems.push(item);
    }
  });

  const client = Array.isArray(row.projects?.clients)
    ? row.projects?.clients[0]
    : row.projects?.clients;

  return {
    id: row.id,
    name: row.name,
    projectId: row.project_id,
    projectName: row.projects?.name ?? null,
    clientName: client?.name ?? null,
    isTemplate: row.is_template,
    subtotal: Number(row.subtotal ?? 0),
    notes: row.notes,
    categories,
    ungroupedItems
  };
}

function mapItemRow(row: ItemRow): BoqItem {
  return {
    id: row.id,
    categoryId: row.category_id,
    description: row.description,
    quantity: Number(row.quantity),
    unit: row.unit,
    unitRate: Number(row.unit_rate),
    total: Number(row.total),
    notes: row.notes,
    sortOrder: row.sort_order
  };
}
