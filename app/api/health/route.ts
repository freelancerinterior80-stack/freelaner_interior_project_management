import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseUrl, supabaseServiceRoleKey } from "@/lib/supabase/config";
import { createClient } from "@supabase/supabase-js";

// Lightweight DB ping — keeps Supabase free-tier project from pausing after 7 days of inactivity.
// Hit this endpoint on a schedule (e.g. every 3 days via an external cron such as cron-job.org).
export async function GET() {
  if (!isSupabaseConfigured() || !supabaseServiceRoleKey) {
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  try {
    const admin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Minimal read — just confirms the DB is reachable without touching user data
    const { error } = await admin.from("settings").select("owner_id").limit(1);
    if (error) throw error;

    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "DB ping failed" },
      { status: 503 }
    );
  }
}
