import { NextResponse } from "next/server";
import { demoBoqs } from "@/features/boq/demo-data";
import { demoQuotations, demoInvoices } from "@/features/documents/demo-data";
import { demoExpenses } from "@/features/expenses/demo-data";
import { demoMaterials, demoMaterialMovements, demoSuppliers } from "@/features/materials/demo-data";
import { demoPayments } from "@/features/payments/demo-data";
import { demoProgressUpdates } from "@/features/progress/demo-data";
import { demoProjects } from "@/features/projects/demo-data";
import { demoSettings } from "@/features/settings/demo-data";
import { requireUser } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const ownerTables = [
  "settings",
  "clients",
  "suppliers",
  "projects",
  "project_files",
  "progress_updates",
  "progress_files",
  "boqs",
  "boq_categories",
  "boq_items",
  "quotations",
  "quotation_items",
  "invoices",
  "invoice_items",
  "expenses",
  "materials",
  "material_movements",
  "payments",
  "reports",
  "offline_sync_entries"
] as const;

type OwnerTable = (typeof ownerTables)[number];

type BackupPayload = {
  exportedAt: string;
  app: string;
  schemaVersion: number;
  source: "supabase" | "demo";
  owner: unknown;
  tables: Record<string, unknown>;
};

export async function GET() {
  const exportedAt = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    return backupResponse(buildDemoBackup(exportedAt), exportedAt);
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,full_name,phone,preferred_language,created_at,updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  let tableEntries: readonly (readonly [OwnerTable, unknown])[];

  try {
    tableEntries = await Promise.all(
      ownerTables.map(async (table) => [table, await fetchOwnerTable(table, user.id)] as const)
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not export backup." },
      { status: 500 }
    );
  }

  return backupResponse(
    {
      exportedAt,
      app: "freelaner-interior-project-management",
      schemaVersion: 1,
      source: "supabase",
      owner: {
        id: user.id,
        email: user.email,
        profile
      },
      tables: Object.fromEntries(tableEntries)
    },
    exportedAt
  );
}

async function fetchOwnerTable(table: OwnerTable, ownerId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Could not export ${table}: ${error.message}`);
  }

  return data ?? [];
}

function buildDemoBackup(exportedAt: string): BackupPayload {
  return {
    exportedAt,
    app: "freelaner-interior-project-management",
    schemaVersion: 1,
    source: "demo",
    owner: {
      id: "demo-owner",
      email: "demo@example.com",
      profile: {
        preferred_language: demoSettings.preferredLanguage
      }
    },
    tables: {
      settings: [demoSettings],
      projects: demoProjects,
      progress_updates: demoProgressUpdates,
      boqs: demoBoqs,
      quotations: demoQuotations,
      invoices: demoInvoices,
      expenses: demoExpenses,
      suppliers: demoSuppliers,
      materials: demoMaterials,
      material_movements: demoMaterialMovements,
      payments: demoPayments
    }
  };
}

function backupResponse(payload: BackupPayload, exportedAt: string) {
  const date = exportedAt.slice(0, 10);

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="freelaner-backup-${date}.json"`
    }
  });
}
