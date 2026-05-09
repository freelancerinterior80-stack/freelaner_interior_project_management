import { redirect } from "next/navigation";
import { getOwnerSessionUser } from "@/lib/auth/owner-auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AppUser = {
  id: string;
  fullName: string;
  email?: string | null;
};

export async function requireUser(): Promise<AppUser> {
  const ownerUser = await getOwnerSessionUser();

  if (ownerUser) {
    return ownerUser;
  }

  if (!isSupabaseConfigured()) {
    return {
      id: "demo-owner",
      fullName: "Demo Owner",
      email: "demo@example.com"
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    fullName: profile?.full_name ?? user.email ?? user.phone ?? "Owner",
    email: user.email
  };
}
