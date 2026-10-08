/**
 * Server-side admin Supabase client — uses SERVICE ROLE key to bypass RLS.
 * NEVER import this in client components. Server-only.
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function getAdminClientConfigError() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  if (!url) {
    return "Missing NEXT_PUBLIC_SUPABASE_URL in environment.";
  }

  if (!serviceKey) {
    return "Missing SUPABASE_SERVICE_ROLE_KEY. Admin pages need the service role key to read live data across all users.";
  }

  return null;
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const configError = getAdminClientConfigError();

  if (configError) {
    throw new Error(`[AdminClient] ${configError}`);
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
