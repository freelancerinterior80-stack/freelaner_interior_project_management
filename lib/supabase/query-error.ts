type QueryError = { message: string; code?: string } | null;

// Logs the raw Supabase error server-side (visible in Vercel function logs) and throws,
// so a real query failure surfaces to the nearest error.tsx boundary instead of being
// silently swallowed into an empty list, zeroed total, or fabricated demo data.
export function assertNoQueryError(error: QueryError, context: string): void {
  if (!error) return;
  console.error(`[supabase] ${context} failed:`, error);
  throw new Error(`Failed to load ${context}.`);
}
