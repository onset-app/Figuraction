"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { nullableText } from "@/lib/utils"
import { type ApplicationInput, applicationSchema } from "@/schemas/application"
import type { ApplicationStatus, CastingStatus } from "@/types/enums"

const GENERIC_ERROR = "Une erreur est survenue. Réessayez."

export type ApplicationActionResult = { success: true } | { success: false; error: string }

/** One row of the figurant's "Mes candidatures" list, with joined casting info. */
export type MyApplication = {
  id: string
  status: ApplicationStatus
  createdAt: string
  casting: {
    id: string
    title: string
    location: string | null
    shootDate: string | null
    status: CastingStatus
  } | null
}

/**
 * The current figurant's applications, newest first, with the casting they
 * applied to.
 *
 * Read via the service-role client, scoped strictly to `figurant_id = user.id`:
 * a figurant must keep seeing castings they applied to even after those castings
 * close, which the RLS `castings_select_open` policy would otherwise hide (the
 * embed would come back null). The explicit figurant_id filter — never a
 * client-supplied value — is the security boundary here, same pattern as
 * uploadPhoto deriving its path from the auth user.
 */
export async function getMyApplications(): Promise<MyApplication[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  const admin = createAdminClient()
  const { data } = await admin
    .from("applications")
    .select(
      "id, status, createdAt:created_at, castings(id, title, location, shootDate:shoot_date, status)"
    )
    .eq("figurant_id", user.id)
    .order("created_at", { ascending: false })

  // supabase-js infers the to-one `castings` embed as an array; it's an object
  // at runtime (or null when the FK target was deleted).
  return (
    (data ?? []) as unknown as Array<
      Omit<MyApplication, "casting"> & {
        castings: MyApplication["casting"]
      }
    >
  ).map(({ castings, ...application }) => ({ ...application, casting: castings ?? null }))
}

/**
 * Withdraw the current figurant's own application (status → withdrawn).
 *
 * Runs on the RLS client: `applications_update_own_figurant` both scopes the
 * update to the caller's rows and caps the new status at pending/withdrawn. The
 * extra figurant_id filter is defense in depth; a missing row after the update
 * means it wasn't theirs.
 */
export async function withdrawApplication(id: string): Promise<ApplicationActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Vous devez être connecté." }
  }

  const { data, error } = await supabase
    .from("applications")
    .update({ status: "withdrawn", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("figurant_id", user.id)
    .select("id")

  if (error) {
    return { success: false, error: GENERIC_ERROR }
  }
  if (!data || data.length === 0) {
    return { success: false, error: "Candidature introuvable." }
  }

  revalidatePath("/app/candidatures")
  return { success: true }
}

/** A review decision a production can apply to an application. */
export type ReviewStatus = Extract<ApplicationStatus, "confirmed" | "rejected">

export type BulkUpdateResult =
  | { success: true; updated: number }
  | { success: false; error: string }

/**
 * Set the review status of one or more applications (production decision).
 *
 * Runs on the RLS client: `applications_update_production` (owns_casting) caps
 * the update to applications on castings the caller owns, so ids the production
 * doesn't own are silently filtered out — `updated` reflects how many actually
 * changed. `reviewed_by`/`reviewed_at` stamp who decided and when; `updated_at`
 * is set explicitly (no DB trigger, cf. #27/#30).
 */
async function reviewApplications(ids: string[], status: ReviewStatus): Promise<BulkUpdateResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Vous devez être connecté." }
  }
  if (ids.length === 0) {
    return { success: true, updated: 0 }
  }

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from("applications")
    .update({ status, reviewed_at: now, reviewed_by: user.id, updated_at: now })
    .in("id", ids)
    .select("id")

  if (error) {
    return { success: false, error: GENERIC_ERROR }
  }
  return { success: true, updated: data?.length ?? 0 }
}

/** Confirm a single application (status → confirmed). */
export async function confirmApplication(id: string): Promise<BulkUpdateResult> {
  return reviewApplications([id], "confirmed")
}

/** Reject a single application (status → rejected). */
export async function rejectApplication(id: string): Promise<BulkUpdateResult> {
  return reviewApplications([id], "rejected")
}

/** Confirm/reject several applications at once. */
export async function bulkUpdateApplications(
  ids: string[],
  status: ReviewStatus
): Promise<BulkUpdateResult> {
  return reviewApplications(ids, status)
}

/** The reviewable context of an application, for the candidate detail page. */
export type ApplicationReviewInfo = {
  id: string
  status: ApplicationStatus
  castingTitle: string
}

/**
 * The status + casting of a single application, or null if the caller doesn't
 * own its casting. RLS's `applications_select_production` (owns_casting)
 * restricts visibility, so this doubles as an ownership check for the
 * confirm/reject buttons on the candidate page.
 */
export async function getApplicationReviewInfo(id: string): Promise<ApplicationReviewInfo | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return null
  }

  const { data } = await supabase
    .from("applications")
    .select("id, status, castings!inner(title)")
    .eq("id", id)
    .maybeSingle()

  if (!data) {
    return null
  }
  const row = data as unknown as {
    id: string
    status: ApplicationStatus
    castings: { title: string }
  }
  return { id: row.id, status: row.status, castingTitle: row.castings.title }
}

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
