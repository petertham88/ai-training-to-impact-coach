import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// A plain (cookie-less) Supabase client used for all v1 data access.
// v1 runs under open RLS with the anon key, so we don't need per-request
// auth context for reads/writes. This keeps data access usable from both
// Server Components and Server Actions without cookie coupling.
let _client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase env missing: run `vercel env pull .env.local` before building.",
    );
  }
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

// Cross-user reads for the trainer /admin + manager views. These need to see
// every participant's rows, which owner-scoped RLS forbids. Uses the service
// role key when configured; otherwise falls back to the anon key (which works
// under v1 open RLS). Once RLS is locked down, add SUPABASE_SERVICE_ROLE_KEY to
// Vercel env and these views keep working with no code change.
let _service: SupabaseClient | null = null;

export function serviceDb(): SupabaseClient {
  if (_service) return _service;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase env missing for serviceDb().");
  }
  _service = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _service;
}

// PostgREST occasionally returns a transient schema-cache 404/network blip
// immediately after cold start. Retry a few times before surfacing an error.
export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 4,
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw lastErr;
}
