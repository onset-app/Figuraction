import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseEnv } from "./env"

/**
 * Refreshes the Supabase auth session on every request and keeps the auth
 * cookies in sync between the request and the response.
 *
 * Returns the refreshed `response` (whose cookies must be copied onto any
 * response that replaces it — see src/middleware.ts), the authenticated `user`
 * (or null), and the `supabase` client bound to this request's cookies so the
 * caller can make further authenticated reads (e.g. the profile role).
 *
 * IMPORTANT: if you replace `response` with a new one (e.g. a redirect), copy
 * over its cookies to avoid desynchronising the browser and server sessions.
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
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabase, user, response: supabaseResponse }
}
