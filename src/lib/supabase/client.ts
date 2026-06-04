import { createBrowserClient } from "@supabase/ssr"
import { getSupabaseEnv } from "./env"

/**
 * Supabase client for use in Client Components (browser).
 * Relies on the public anon key — all security is enforced via RLS policies.
 */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv()
  return createBrowserClient(url, anonKey)
}
