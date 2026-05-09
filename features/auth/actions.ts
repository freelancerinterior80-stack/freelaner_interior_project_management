"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { isOwnerAuthConfigured, setOwnerSessionCookie, verifyOwnerCredentials } from "@/lib/auth/owner-auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const emailLoginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().optional()
});

const phoneLoginSchema = z.object({
  phone: z.string().min(8, "Enter a valid phone number.")
});

const verifySchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  token: z.string().min(4, "Enter the code.")
});

export type AuthActionState = {
  error?: string;
};

export async function signInWithEmail(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = emailLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password") ?? undefined
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your email address." };
  }

  if (isOwnerAuthConfigured()) {
    if (!parsed.data.password) {
      return { error: "Enter your password." };
    }

    if (!verifyOwnerCredentials(parsed.data.email, parsed.data.password)) {
      return { error: "Email or password is incorrect." };
    }

    await setOwnerSessionCookie();
    redirect("/dashboard");
  }

  if (!isSupabaseConfigured()) {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${await getAppUrl()}/dashboard`
    }
  });

  if (error) {
    return { error: error.message };
  }

  redirect(`/verify?email=${encodeURIComponent(parsed.data.email)}`);
}

export async function signInWithPhone(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = phoneLoginSchema.safeParse({
    phone: formData.get("phone")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your phone number." };
  }

  if (!isSupabaseConfigured()) {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone: parsed.data.phone
  });

  if (error) {
    return { error: error.message };
  }

  redirect(`/verify?phone=${encodeURIComponent(parsed.data.phone)}`);
}

export async function verifyOtp(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = verifySchema.safeParse({
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    token: formData.get("token")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter the verification code." };
  }

  if (!isSupabaseConfigured()) {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();
  const isEmail = Boolean(parsed.data.email);
  const { error } = await supabase.auth.verifyOtp(
    isEmail
      ? {
          email: parsed.data.email || "",
          token: parsed.data.token,
          type: "email"
        }
      : {
          phone: parsed.data.phone || "",
          token: parsed.data.token,
          type: "sms"
        }
  );

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

async function getAppUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const isLocalUrl = configuredUrl?.includes("localhost") || configuredUrl?.includes("127.0.0.1");

  if (configuredUrl && !(process.env.NODE_ENV === "production" && isLocalUrl)) {
    return configuredUrl.replace(/\/$/, "");
  }

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`.replace(/\/$/, "");
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (host) {
    const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
    return `${protocol}://${host}`.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}
