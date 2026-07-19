"use server"

import * as Sentry from "@sentry/nextjs"
import type { AuthError } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { after } from "next/server"
import { db } from "@/db"
import { profiles } from "@/db/schema"
import { getAppUrl } from "@/lib/env"
import { sendWelcomeEmail } from "@/lib/resend/send"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { safeAppPath } from "@/lib/utils"
import {
  type LoginInput,
  loginSchema,
  type ResetPasswordInput,
  resetPasswordSchema,
  type SignupInput,
  signupSchema,
  type UpdatePasswordInput,
  updatePasswordSchema,
} from "@/schemas/auth"

/** Discriminated result returned by every auth action. */
export type AuthActionResult = { success: true } | { success: false; error: string }

/** Translate a Supabase auth error into a user-facing French message. */
function mapSignupError(error: AuthError): string {
  const message = error.message.toLowerCase()

  if (message.includes("already registered") || message.includes("already been registered")) {
    return "Un compte existe déjà avec cet email."
  }
  if (message.includes("password")) {
    return "Le mot de passe est trop faible."
  }
  if (error.status === 429 || message.includes("rate limit")) {
    return "Trop de tentatives. Réessayez dans quelques minutes."
  }
  return "Une erreur est survenue lors de l'inscription. Réessayez."
}

/**
 * Whether an unknown error is (or wraps) a Postgres unique violation (23505).
 * Walks the `cause` chain because Drizzle may wrap the driver error.
 */
function isUniqueViolation(err: unknown): boolean {
  for (let e = err; typeof e === "object" && e !== null; e = (e as { cause?: unknown }).cause) {
    if ((e as { code?: unknown }).code === "23505") {
      return true
    }
  }
  return false
}

/**
 * Register a new figurant or production account.
 *
 * Creates the Supabase auth user, then inserts the matching profile row. The
 * profile insert runs through Drizzle (which connects as the DB owner and
 * bypasses RLS) because, when email confirmation is enabled, signUp returns no
 * session — an RLS-gated insert as `authenticated` would be rejected.
 *
 * If the profile insert fails for any reason OTHER than "profile already
 * exists", the freshly created auth user is deleted so we never leave an
 * orphaned account behind.
 */
export async function signup(input: SignupInput): Promise<AuthActionResult> {
  // Re-validate server-side: the client validates for UX, but the action is a
  // trust boundary and must not rely on the caller having done so.
  const parsed = signupSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    }
  }

  const { email, password, firstName, lastName, role } = parsed.data

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getAppUrl()}/auth/callback`,
      data: { first_name: firstName, last_name: lastName, role },
    },
  })

  if (error) {
    return { success: false, error: mapSignupError(error) }
  }

  const user = data.user
  if (!user) {
    return { success: false, error: "Une erreur est survenue lors de l'inscription. Réessayez." }
  }

  // With email confirmation enabled, signUp on an existing email returns a
  // decoy user with no identities (enumeration protection) instead of an error.
  if (user.identities && user.identities.length === 0) {
    return { success: false, error: "Un compte existe déjà avec cet email." }
  }

  try {
    await db.insert(profiles).values({
      id: user.id,
      email,
      role,
      firstName,
      lastName,
    })
  } catch (err) {
    // A duplicate profile means this auth user already completed a signup —
    // typically a re-submit before confirming the email, where Supabase
    // returns the ORIGINAL user (same id) and re-sends the confirmation.
    // Deleting the auth user here would destroy that pending account and dead-
    // link the confirmation email, so point the user back at their inbox.
    if (isUniqueViolation(err)) {
      return {
        success: false,
        error:
          "Un compte existe déjà avec cet email. Vérifiez votre boîte mail pour le lien de confirmation.",
      }
    }

    // Anything else: roll back the auth user so a retry with the same email
    // can succeed. The rollback itself is best-effort — if it also fails, keep
    // the friendly error and let Sentry carry the details.
    try {
      const admin = createAdminClient()
      await admin.auth.admin.deleteUser(user.id)
    } catch (rollbackErr) {
      Sentry.captureException(rollbackErr, {
        tags: { feature: "auth" },
        extra: { step: "signup-rollback", userId: user.id },
      })
    }
    Sentry.captureException(err, { tags: { feature: "auth" }, extra: { step: "signup-profile" } })
    return { success: false, error: "Une erreur est survenue lors de l'inscription. Réessayez." }
  }

  // Best-effort welcome email — never block or fail signup on a mail error
  // (sendWelcomeEmail swallows its own failures and reports them to Sentry).
  // Scheduled with after() so the render + Resend round-trip doesn't sit on
  // the signup response path, while still surviving the serverless response.
  after(() => sendWelcomeEmail({ to: email, firstName, role }))

  return { success: true }
}

/** Translate a Supabase sign-in error into a user-facing French message. */
function mapLoginError(error: AuthError): string {
  const message = error.message.toLowerCase()

  if (message.includes("email not confirmed")) {
    return "Veuillez confirmer votre email avant de vous connecter."
  }
  if (message.includes("invalid login credentials")) {
    return "Email ou mot de passe incorrect."
  }
  if (error.status === 429 || message.includes("rate limit")) {
    return "Trop de tentatives. Réessayez dans quelques minutes."
  }
  return "Une erreur est survenue lors de la connexion. Réessayez."
}

/**
 * Sign in with email and password.
 *
 * On success the session cookies are written by the server client and the user
 * is redirected to `next` (validated — in-app paths only) or the dashboard. On
 * failure a typed error is returned so the form can render it inline. Errors
 * are kept generic (never distinguishing a wrong password from an unknown
 * email) to avoid account enumeration.
 */
export async function login(input: LoginInput, next?: string | null): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    }
  }

  const { email, password } = parsed.data

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { success: false, error: mapLoginError(error) }
  }

  // redirect() throws internally, so it must sit outside any try/catch. The
  // return type below is never reached on success.
  redirect(safeAppPath(next))
}

/** Sign out the current user and return to the login page. */
export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

/** Map a rate-limit error to a French message, else a generic fallback. */
function mapRateLimitError(error: AuthError, fallback: string): string {
  if (error.status === 429 || error.message.toLowerCase().includes("rate limit")) {
    return "Trop de tentatives. Réessayez dans quelques minutes."
  }
  return fallback
}

/**
 * Send a password-reset email.
 *
 * The recovery link points at /auth/callback, which exchanges the code for a
 * session and forwards to /update-password. Supabase does not reveal whether
 * the address exists (it returns success either way), so the caller should show
 * a neutral "if an account exists, an email was sent" message on success.
 */
export async function resetPassword(input: ResetPasswordInput): Promise<AuthActionResult> {
  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getAppUrl()}/auth/callback?next=/update-password`,
  })

  if (error) {
    return {
      success: false,
      error: mapRateLimitError(
        error,
        "Une erreur est survenue lors de l'envoi de l'email. Réessayez."
      ),
    }
  }

  return { success: true }
}

/**
 * Set a new password for the currently authenticated user.
 *
 * Reached from the recovery session established by /auth/callback. Requires a
 * live session — if it has expired the user must request a new reset link.
 */
export async function updatePassword(input: UpdatePasswordInput): Promise<AuthActionResult> {
  const parsed = updatePasswordSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return {
      success: false,
      error: "Session expirée. Refaites une demande de réinitialisation.",
    }
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) {
    if (error.message.toLowerCase().includes("password")) {
      return { success: false, error: "Le mot de passe est trop faible." }
    }
    return {
      success: false,
      error: mapRateLimitError(
        error,
        "Une erreur est survenue lors de la mise à jour du mot de passe. Réessayez."
      ),
    }
  }

  // The recovery session is now a normal session; send the user into the app.
  redirect("/app/dashboard")
}
