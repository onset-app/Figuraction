"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { nullableText } from "@/lib/utils"
import { type ApplicationInput, applicationSchema } from "@/schemas/application"
import type { ApplicationStatus } from "@/types/enums"

const GENERIC_ERROR = "Une erreur est survenue. Réessayez."

export type ApplicationActionResult = { success: true } | { success: false; error: string }

/**
 * The current figurant's own application to a given casting, or null. Drives
 * the "already applied" state (disabled form + status) on the detail page.
 * RLS's `applications_select_own_figurant` restricts this to the caller's row.
 */
export async function getMyApplication(
  castingId: string
): Promise<{ status: ApplicationStatus } | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return null
  }

  const { data } = await supabase
    .from("applications")
    .select("status")
    .eq("casting_id", castingId)
    .eq("figurant_id", user.id)
    .maybeSingle()

  return (data as { status: ApplicationStatus } | null) ?? null
}

/**
 * Apply to a casting as the current figurant.
 *
 * `figurant_id` is taken from the authenticated session, never the client, and
 * the row starts as 'pending' — both mandated by the `applications_insert_own_figurant`
 * RLS policy (which also enforces the figurant role). Two guards beyond RLS:
 *   - The casting must be open: the insert policy doesn't check casting status,
 *     so we verify it via the RLS-scoped read (only open castings in open
 *     projects are visible to the applicant).
 *   - Duplicate application: the UNIQUE(casting_id, figurant_id) constraint is
 *     the race-safe backstop, surfaced as a friendly message (23505).
 */
export async function createApplication(input: ApplicationInput): Promise<ApplicationActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Vous devez être connecté." }
  }

  const parsed = applicationSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." }
  }

  const { data: casting } = await supabase
    .from("castings")
    .select("id")
    .eq("id", parsed.data.castingId)
    .eq("status", "open")
    .maybeSingle()
  if (!casting) {
    return { success: false, error: "Ce casting n'accepte plus de candidatures." }
  }

  const { error } = await supabase.from("applications").insert({
    casting_id: parsed.data.castingId,
    figurant_id: user.id,
    status: "pending",
    message: nullableText(parsed.data.message),
  })

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Vous avez déjà postulé à ce casting." }
    }
    if (error.code === "42501") {
      return { success: false, error: "Seuls les figurants peuvent postuler." }
    }
    return { success: false, error: GENERIC_ERROR }
  }

  revalidatePath("/app/candidatures")
  revalidatePath(`/app/castings/${parsed.data.castingId}`)
  return { success: true }
}
