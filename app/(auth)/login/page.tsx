import { createClient } from "@supabase/supabase-js";
import { LoginForm } from "@/features/auth/components/login-form";
import { isOwnerAuthConfigured } from "@/lib/auth/owner-auth";
import { isSupabaseConfigured, supabaseUrl, supabaseServiceRoleKey } from "@/lib/supabase/config";

async function getLogoUrl(): Promise<string | null> {
  if (!isSupabaseConfigured() || !supabaseServiceRoleKey) return null;

  try {
    const ownerId = process.env.OWNER_AUTH_ID ?? "00000000-0000-0000-0000-000000000001";
    const admin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data } = await admin
      .from("settings")
      .select("logo_path")
      .eq("owner_id", ownerId)
      .is("deleted_at", null)
      .maybeSingle();

    if (!data?.logo_path) return null;

    const { data: urlData } = await admin.storage
      .from("project-files")
      .createSignedUrl(data.logo_path, 3600);

    return urlData?.signedUrl ?? null;
  } catch {
    return null;
  }
}

export default async function LoginPage() {
  const [ownerAuthEnabled, logoUrl] = await Promise.all([
    Promise.resolve(isOwnerAuthConfigured()),
    getLogoUrl()
  ]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-8">
      <div className="mb-8">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt="Freelancer Interior"
            className="mb-5 h-20 w-auto object-contain"
          />
        ) : null}
        <h1 className="text-3xl font-semibold tracking-normal text-charcoal-900">
          Freelancer Interior
        </h1>
        <p className="mt-3 text-base font-medium text-wood-700">Sign in to your projects</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {ownerAuthEnabled
            ? "Use your owner email and password. The app keeps your session active on this device."
            : "Use email or phone. The app keeps your session active on this device."}
        </p>
      </div>
      <LoginForm ownerAuthEnabled={ownerAuthEnabled} />
    </div>
  );
}
