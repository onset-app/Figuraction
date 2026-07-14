import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Auth redirect handler for email links (signup confirmation and password
 * recovery). Supabase appends a one-time `code` that we exchange for a session;
 * the session cookies are written by the server client. On success we forward
 * to `next` (defaults to the dashboard), otherwise back to login with an error.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/app/dashboard"

  // Only allow same-site relative redirects to avoid an open-redirect.
  const destination = next.startsWith("/") ? next : "/app/dashboard"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
