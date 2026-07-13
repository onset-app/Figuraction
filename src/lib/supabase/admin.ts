import { createClient } from "@supabase/supabase-js"

/**
 * Service-role Supabase client. Bypasses RLS and exposes the Auth admin API
 * (e.g. deleting a user). SERVER-SIDE ONLY — never import this into a client
 * component: the service role key must never reach the browser.
 *
 * Used by flows that must run before a user session exists, such as the signup
 * profile insert (when email confirmation is enabled, signUp returns no session
 * so an RLS-gated insert as `authenticated` would be rejected).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set."
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
