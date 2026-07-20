import * as Sentry from "@sentry/nextjs"
import type { EmailOtpType } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Auth redirect handler for email links (signup confirmation + password
 * recovery).
 *
 * Supabase delivers one of two shapes depending on the flow / email template,
 * and we must accept both:
 *   - a PKCE `code`            → exchangeCodeForSession(code)
 *   - a `token_hash` + `type`  → verifyOtp({ type, token_hash })
 * The previous handler only did the first, so recovery links carrying a
 * token_hash fell straight through to /login?error=auth.
 *
 * On success we forward to a same-site `next`, falling back to the password
 * form for recovery links (so they reach it even if `next` was dropped in the
 * Supabase redirect hop) and the dashboard otherwise. Failures land on
 * /login?error=auth and are reported so the cause is diagnosable.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const nextParam = searchParams.get("next")

  // Same-site relative paths only (reject "//host" protocol-relative URLs).
  const isSafeNext = nextParam?.startsWith("/") && !nextParam.startsWith("//")
  const fallback = type === "recovery" ? "/update-password" : "/app/dashboard"
  const destination = isSafeNext ? (nextParam as string) : fallback

  const supabase = await createClient()

  let error: unknown = null
  if (code) {
    error = (await supabase.auth.exchangeCodeForSession(code)).error
  } else if (tokenHash && type) {
    error = (await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error
  } else {
    error = new Error("Auth callback missing both code and token_hash")
  }

  if (error) {
    Sentry.captureException(error, {
      tags: { feature: "auth" },
      extra: { step: "callback", type: type ?? undefined, hasCode: Boolean(code) },
    })
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  return NextResponse.redirect(`${origin}${destination}`)
}
