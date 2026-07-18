import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { getUserRole } from "@/lib/supabase/roles"
import { safeAppPath } from "@/lib/utils"
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

/**
 * Build a same-origin redirect that carries over the refreshed session cookies.
 * `next` (optional) is preserved as a `?next=` param on the destination.
 */
function redirectTo(
  request: NextRequest,
  pathname: string,
  from: NextResponse,
  next?: string
): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = next ? `?next=${encodeURIComponent(next)}` : ""
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

  // Unauthenticated access to the app → send to login, remembering the
  // intended destination (unless it's just the default landing spot).
  if (isAppRoute && !user) {
    const next = pathname === "/app" || pathname === "/app/dashboard" ? undefined : pathname
    return redirectTo(request, "/login", response, next)
  }

  // Already signed in but on an auth page → send into the app, honouring a
  // pending ?next= destination (validated to in-app paths).
  if (isAuthPage && user) {
    return redirectTo(request, safeAppPath(request.nextUrl.searchParams.get("next")), response)
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
