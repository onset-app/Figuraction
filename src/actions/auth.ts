"use server"

import type { AuthError } from "@supabase/supabase-js"
import { db } from "@/db"
import { profiles } from "@/db/schema"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { type SignupInput, signupSchema } from "@/schemas/auth"

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
 * Register a new figurant or production account.
 *
 * Creates the Supabase auth user, then inserts the matching profile row. The
 * profile insert runs through Drizzle (which connects as the DB owner and
 * bypasses RLS) because, when email confirmation is enabled, signUp returns no
 * session — an RLS-gated insert as `authenticated` would be rejected.
 *
 * If the profile insert fails, the freshly created auth user is deleted so we
 * never leave an orphaned account behind.
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
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
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
  } catch {
    // Roll back the auth user so a retry with the same email can succeed.
    const admin = createAdminClient()
    await admin.auth.admin.deleteUser(user.id)
    return { success: false, error: "Une erreur est survenue lors de l'inscription. Réessayez." }
  }

  return { success: true }
}
