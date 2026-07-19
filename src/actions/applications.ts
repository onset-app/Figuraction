"use server"

import * as Sentry from "@sentry/nextjs"
import { revalidatePath } from "next/cache"
import { sendApplicationConfirmedEmail, sendApplicationRejectedEmail } from "@/lib/resend/send"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { chunk, formatDateFr, nullableText } from "@/lib/utils"
import { type ApplicationInput, applicationSchema } from "@/schemas/application"
import type { ApplicationStatus, CastingStatus } from "@/types/enums"

/** The server-side Supabase client type, derived from the factory. */
type ServerClient = Awaited<ReturnType<typeof createClient>>

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
  const { data, error } = await admin
    .from("applications")
    .select(
      "id, status, createdAt:created_at, castings(id, title, location, shootDate:shoot_date, status)"
    )
    .eq("figurant_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    Sentry.captureException(error, { tags: { feature: "applications" }, extra: { step: "mine" } })
  }

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
    Sentry.captureException(error, {
      tags: { feature: "applications" },
      extra: { step: "withdraw" },
    })
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
 * Notify the figurants of the applications that were just reviewed.
 *
 * Reads through the production's RLS session (same visibility as the update
 * that preceded it), joining the figurant email + casting/project context, and
 * dispatches a confirmation or rejection email per application. Best-effort:
 * the senders swallow their own failures, and any unexpected error here is
 * caught so a mail problem never turns a successful review into a failed one.
 */
async function notifyReviewOutcome(
  supabase: ServerClient,
  ids: string[],
  status: ReviewStatus
): Promise<void> {
  try {
    const { data } = await supabase
      .from("applications")
      .select(
        "id, figurant:profiles!figurant_id(email, firstName:first_name), castings!inner(title, location, shootDate:shoot_date, projects!inner(title))"
      )
      .in("id", ids)

    const rows = (data ?? []) as unknown as Array<{
      figurant: { email: string; firstName: string } | null
      castings: {
        title: string
        location: string | null
        shootDate: string | null
        projects: { title: string } | null
      }
    }>

    // Chunked so a large bulk review doesn't fire an unbounded burst of
    // concurrent Resend calls (their rate limit would silently eat some).
    for (const batch of chunk(rows, 5)) {
      await Promise.all(
        batch.map((row) => {
          if (!row.figurant?.email) {
            return undefined
          }
          if (status === "confirmed") {
            return sendApplicationConfirmedEmail({
              to: row.figurant.email,
              firstName: row.figurant.firstName,
              castingTitle: row.castings.title,
              projectTitle: row.castings.projects?.title ?? "votre tournage",
              location: row.castings.location ?? "à confirmer",
              shootDate: formatDateFr(row.castings.shootDate),
            })
          }
          return sendApplicationRejectedEmail({
            to: row.figurant.email,
            firstName: row.figurant.firstName,
            castingTitle: row.castings.title,
          })
        })
      )
    }
  } catch (error) {
    // Email is a best-effort side effect; never fail the review because of it
    // — but do leave a trace (e.g. the context SELECT failing).
    Sentry.captureException(error, {
      tags: { feature: "applications" },
      extra: { step: "notify-review" },
    })
  }
}

/**
 * Set the review status of one or more applications (production decision).
 *
 * Runs on the RLS client: `applications_update_production` (owns_casting) caps
 * the update to applications on castings the caller owns, so ids the production
 * doesn't own are silently filtered out — `updated` reflects how many actually
 * changed. `reviewed_by`/`reviewed_at` stamp who decided and when; `updated_at`
 * is set explicitly (no DB trigger, cf. #27/#30).
 *
 * The figurants whose applications actually changed are then emailed (all three
 * public entry points — confirm/reject single and bulk — funnel through here).
 */
async function reviewApplications(ids: string[], status: ReviewStatus): Promise<BulkUpdateResult> {
  // Trust boundary: TypeScript's ReviewStatus only constrains honest callers.
  // A crafted "pending" would pass the RLS WITH CHECK (un-review is allowed)
  // but then hit notifyReviewOutcome's binary branch and send rejection
  // emails for applications that are actually back to pending.
  if (status !== "confirmed" && status !== "rejected") {
    return { success: false, error: "Statut invalide." }
  }
  if (!Array.isArray(ids) || ids.length > 200 || ids.some((id) => typeof id !== "string")) {
    return { success: false, error: "Données invalides." }
  }

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
    Sentry.captureException(error, { tags: { feature: "applications" }, extra: { step: "review" } })
    return { success: false, error: GENERIC_ERROR }
  }

  const updatedIds = (data ?? []).map((row) => (row as { id: string }).id)
  if (updatedIds.length > 0) {
    await notifyReviewOutcome(supabase, updatedIds, status)
  }

  return { success: true, updated: updatedIds.length }
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
  figurantId: string
  status: ApplicationStatus
  castingTitle: string
}

/**
 * The status + casting of a single application, or null if the caller doesn't
 * own its casting. RLS's `applications_select_production` (owns_casting)
 * restricts visibility, so this doubles as an ownership check for the
 * confirm/reject buttons on the candidate page. `figurantId` lets the page
 * confirm the application actually belongs to the profile being viewed.
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
    .select("id, figurantId:figurant_id, status, castings!inner(title)")
    .eq("id", id)
    .maybeSingle()

  if (!data) {
    return null
  }
  const row = data as unknown as {
    id: string
    figurantId: string
    status: ApplicationStatus
    castings: { title: string }
  }
  return {
    id: row.id,
    figurantId: row.figurantId,
    status: row.status,
    castingTitle: row.castings.title,
  }
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
 *   - A previously withdrawn application is revived (status → pending) rather
 *     than re-inserted: the UNIQUE(casting_id, figurant_id) constraint would
 *     otherwise permanently lock a figurant out of a casting after a withdrawal.
 *   - Duplicate active application: the unique constraint is the race-safe
 *     backstop for the insert path, surfaced as a friendly message (23505).
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

  const message = nullableText(parsed.data.message)

  // An existing row means the figurant already applied. If they had withdrawn,
  // revive it (clearing any stale review); otherwise it's a genuine duplicate.
  const { data: existing } = await supabase
    .from("applications")
    .select("id, status")
    .eq("casting_id", parsed.data.castingId)
    .eq("figurant_id", user.id)
    .maybeSingle()

  if (existing) {
    if ((existing as { status: ApplicationStatus }).status !== "withdrawn") {
      return { success: false, error: "Vous avez déjà postulé à ce casting." }
    }
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        status: "pending",
        message,
        reviewed_at: null,
        reviewed_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", (existing as { id: string }).id)
      .eq("figurant_id", user.id)
    if (updateError) {
      Sentry.captureException(updateError, {
        tags: { feature: "applications" },
        extra: { step: "revive" },
      })
      return { success: false, error: GENERIC_ERROR }
    }
    revalidatePath("/app/candidatures")
    revalidatePath(`/app/castings/${parsed.data.castingId}`)
    return { success: true }
  }

  const { error } = await supabase.from("applications").insert({
    casting_id: parsed.data.castingId,
    figurant_id: user.id,
    status: "pending",
    message,
  })

  if (error) {
    // 23505 races another insert between the check above and here.
    if (error.code === "23505") {
      return { success: false, error: "Vous avez déjà postulé à ce casting." }
    }
    if (error.code === "42501") {
      return { success: false, error: "Seuls les figurants peuvent postuler." }
    }
    Sentry.captureException(error, { tags: { feature: "applications" }, extra: { step: "apply" } })
    return { success: false, error: GENERIC_ERROR }
  }

  revalidatePath("/app/candidatures")
  revalidatePath(`/app/castings/${parsed.data.castingId}`)
  return { success: true }
}
