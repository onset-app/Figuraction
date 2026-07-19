"use server"

import * as Sentry from "@sentry/nextjs"
import { sendConvocationEmail } from "@/lib/resend/send"
import { createClient } from "@/lib/supabase/server"
import { chunk, formatDateFr } from "@/lib/utils"
import { type ConvocationInput, convocationSchema } from "@/schemas/convocation"

const GENERIC_ERROR = "Une erreur est survenue. Réessayez."

export type ConvocationResult = { success: true; sent: number } | { success: false; error: string }

/**
 * Send a convocation email to every confirmed figurant of a project.
 *
 * Security: the recipient list is derived server-side, never supplied by the
 * client. The project is read scoped to `production_id = user.id` (ownership
 * gate, same as getProject), and the confirmed applications are read through
 * RLS — `applications_select_production` (owns_casting) only returns the
 * caller's applications and `profiles_select_figurants_by_staff` exposes the
 * figurant email. A production therefore can only convoke its own confirmed
 * figurants.
 *
 * Figurants confirmed on several castings of the same project are de-duplicated
 * by email so nobody receives the convocation twice.
 */
export async function sendConvocation(input: ConvocationInput): Promise<ConvocationResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Vous devez être connecté." }
  }

  const parsed = convocationSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." }
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id, title")
    .eq("id", parsed.data.projectId)
    .eq("production_id", user.id)
    .maybeSingle()
  if (!project) {
    return { success: false, error: "Projet introuvable ou accès refusé." }
  }
  const projectTitle = (project as { title: string }).title

  const { data, error } = await supabase
    .from("applications")
    .select(
      "figurant:profiles!figurant_id(email, firstName:first_name), castings!inner(project_id)"
    )
    .eq("status", "confirmed")
    .eq("castings.project_id", parsed.data.projectId)
  if (error) {
    Sentry.captureException(error, { tags: { feature: "emails" }, extra: { step: "recipients" } })
    return { success: false, error: GENERIC_ERROR }
  }

  // supabase-js types the to-one embed as an array; it's an object at runtime.
  const rows = (data ?? []) as unknown as Array<{
    figurant: { email: string; firstName: string } | null
  }>

  // De-duplicate figurants confirmed on multiple castings of this project.
  const recipients = new Map<string, string>()
  for (const row of rows) {
    if (row.figurant?.email) {
      recipients.set(row.figurant.email, row.figurant.firstName)
    }
  }

  const date = formatDateFr(parsed.data.date)
  // Chunked so convoking a large confirmed list doesn't fire an unbounded
  // burst of concurrent Resend calls (their rate limit would eat some).
  let sent = 0
  for (const batch of chunk([...recipients], 5)) {
    const results = await Promise.all(
      batch.map(([email, firstName]) =>
        sendConvocationEmail({
          to: email,
          firstName,
          projectTitle,
          location: parsed.data.location,
          address: parsed.data.address,
          date,
          time: parsed.data.time,
          instructions: parsed.data.instructions,
          contactName: parsed.data.contactName,
          contactPhone: parsed.data.contactPhone,
        })
      )
    )
    sent += results.filter((r) => r.success).length
  }

  return { success: true, sent }
}
