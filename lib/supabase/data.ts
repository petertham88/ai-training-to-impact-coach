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
