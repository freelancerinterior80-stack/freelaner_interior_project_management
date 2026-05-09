import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { shouldUseOwnerServiceRole } from "@/lib/auth/owner-auth";
import { supabaseAnonKey, supabaseServiceRoleKey, supabaseUrl } from "@/lib/supabase/config";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const key = shouldUseOwnerServiceRole() ? supabaseServiceRoleKey : supabaseAnonKey;

  return createServerClient(supabaseUrl, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always set cookies. Middleware refreshes sessions.
        }
      }
    }
  });
}
