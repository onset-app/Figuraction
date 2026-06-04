import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabaseEnv } from "./env"

/**
 * Supabase client for use in Server Components, Server Actions, and Route Handlers.
 * Reads and writes the auth session through Next.js cookies.
 *
 * Note: the `setAll` call may throw when invoked from a Server Component (where
 * cookies are read-only). That is expected and safe to ignore — session refresh
 * is handled by the middleware (see ./middleware.ts).
 */
export async function createClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = getSupabaseEnv()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Called from a Server Component — safe to ignore, middleware refreshes the session.
        }
      },
    },
  })
}
