import type { SupabaseClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import type { UserRole } from "@/types/enums"

/**
 * Route-prefix guards for role-restricted areas of the app. The first matching
 * prefix decides which roles may enter; anything not listed is open to every
 * authenticated user. Admins are allowed everywhere.
 */
const ROLE_GUARDS: ReadonlyArray<{ prefix: string; allow: ReadonlyArray<UserRole> }> = [
  { prefix: "/app/admin", allow: ["admin"] },
  { prefix: "/app/projets", allow: ["production", "admin"] },
  { prefix: "/app/candidats", allow: ["production", "admin"] },
]

/** Read the caller's authoritative role from their profile (RLS: own row). */
async function getUserRole(supabase: SupabaseClient, userId: string): Promise<UserRole | null> {
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).single()
  return (data?.role as UserRole | undefined) ?? null
}

/** Build a same-origin redirect that carries over the refreshed session cookies. */
function redirectTo(request: NextRequest, pathname: string, from: NextResponse): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = ""
  const response = NextResponse.redirect(url)
  for (const cookie of from.cookies.getAll()) {
    response.cookies.set(cookie)
  }
  return response
}

export async function proxy(request: NextRequest) {
  const { supabase, user, response } = await updateSession(request)
  const { pathname } = request.nextUrl

  const isAppRoute = pathname === "/app" || pathname.startsWith("/app/")
  const isAuthPage = pathname === "/login" || pathname === "/signup"

  // Unauthenticated access to the app → send to login.
  if (isAppRoute && !user) {
    return redirectTo(request, "/login", response)
  }

  // Already signed in but on an auth page → send to the dashboard.
  if (isAuthPage && user) {
    return redirectTo(request, "/app/dashboard", response)
  }

  // Role gating for restricted app sections.
  if (isAppRoute && user) {
    const guard = ROLE_GUARDS.find(({ prefix }) => pathname.startsWith(prefix))
    if (guard) {
      const role = await getUserRole(supabase, user.id)
      if (!role || !guard.allow.includes(role)) {
        return redirectTo(request, "/app/dashboard", response)
      }
    }
  }

  return response
}

export const config = {
  matcher: ["/app/:path*", "/login", "/signup"],
}
