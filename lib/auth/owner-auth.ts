import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import type { AppUser } from "@/lib/auth/guards";
import { supabaseUrl, supabaseServiceRoleKey } from "@/lib/supabase/config";

const OWNER_SESSION_COOKIE = "freelaner_owner_session";
const DEFAULT_OWNER_ID = "00000000-0000-0000-0000-000000000001";

type OwnerSessionPayload = {
  id: string;
  email: string;
  fullName: string;
  exp: number;
};

export function isOwnerAuthConfigured() {
  return Boolean(process.env.OWNER_AUTH_EMAIL && process.env.OWNER_AUTH_PASSWORD);
}

export function getOwnerId() {
  return process.env.OWNER_AUTH_ID ?? DEFAULT_OWNER_ID;
}

export function verifyOwnerCredentials(email: string, password: string) {
  const ownerEmail = process.env.OWNER_AUTH_EMAIL;
  const ownerPassword = process.env.OWNER_AUTH_PASSWORD;

  if (!ownerEmail || !ownerPassword) {
    return false;
  }

  return constantTimeEqual(email.trim().toLowerCase(), ownerEmail.trim().toLowerCase()) &&
    constantTimeEqual(password, ownerPassword);
}

export async function setOwnerSessionCookie() {
  const ownerEmail = process.env.OWNER_AUTH_EMAIL;

  if (!ownerEmail) {
    return;
  }

  const fullName = process.env.OWNER_AUTH_NAME ?? "Owner";
  // Always use the fixed owner ID so it matches owner_id stored in every DB row.
  const ownerId = getOwnerId();

  // Best-effort: ensure Supabase auth user + profile exist for FK constraints.
  // Failures here do NOT block login — service role bypasses RLS anyway.
  await ensureOwnerInSupabase(ownerEmail, fullName, ownerId).catch(() => {});

  const payload: OwnerSessionPayload = {
    id: ownerId,
    email: ownerEmail,
    fullName,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
  };

  const cookieStore = await cookies();
  cookieStore.set(OWNER_SESSION_COOKIE, signPayload(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/"
  });
}

// Ensures a Supabase auth user with the target UUID + a profiles row exist.
// Creates the user with the specific UUID so all data rows with that owner_id remain accessible.
async function ensureOwnerInSupabase(email: string, fullName: string, targetId: string) {
  if (!supabaseUrl || !supabaseServiceRoleKey) return;

  const admin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Check if the user with targetId already exists
  const { data: byId } = await admin.auth.admin.getUserById(targetId);
  if (!byId?.user) {
    // Create with the specific UUID (may fail if email is already taken with a different UUID)
    await admin.auth.admin.createUser({
      id: targetId,
      email,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });
  }

  // Ensure profile row exists for targetId
  await admin.from("profiles").upsert(
    { id: targetId, full_name: fullName },
    { onConflict: "id", ignoreDuplicates: true }
  );
}

export async function getOwnerSessionUser(): Promise<AppUser | null> {
  if (!isOwnerAuthConfigured()) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(OWNER_SESSION_COOKIE)?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    return null;
  }

  return {
    id: payload.id,
    fullName: payload.fullName,
    email: payload.email
  };
}

export function shouldUseOwnerServiceRole() {
  return isOwnerAuthConfigured() && Boolean(supabaseServiceRoleKey);
}

function signPayload(payload: OwnerSessionPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

function verifyToken(token: string): OwnerSessionPayload | null {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature || !constantTimeEqual(sign(encodedPayload), signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as OwnerSessionPayload;

    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function getSessionSecret() {
  return process.env.OWNER_AUTH_SECRET ?? process.env.OWNER_AUTH_PASSWORD ?? supabaseServiceRoleKey;
}

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
