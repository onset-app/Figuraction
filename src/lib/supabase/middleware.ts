import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseEnv } from "./env"

/**
 * Refreshes the Supabase auth session on every request and keeps the auth
 * cookies in sync between the request and the response.
 *
 * This helper only handles session refresh. Route protection and role-based
 * routing are layered on top in src/middleware.ts (ticket #22).
 *
 * IMPORTANT: always return the `supabaseResponse` object as-is. If you create a
 * new response, copy over `request.cookies` to avoid desynchronising the
 * browser and server sessions.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const { url, anonKey } = getSupabaseEnv()

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        supabaseResponse = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options)
        }
      },
    },
  })

  // Do not run code between createServerClient and getUser — it refreshes the
  // session token and must happen before any other logic.
  await supabase.auth.getUser()

  return supabaseResponse
}
