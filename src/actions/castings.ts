"use server"

import * as Sentry from "@sentry/nextjs"
import { revalidatePath } from "next/cache"
import { getUserRole } from "@/lib/supabase/roles"
import { createClient } from "@/lib/supabase/server"
import { nullableText, toDateString } from "@/lib/utils"
import { type CastingInput, castingSchema } from "@/schemas/casting"
import type { Casting } from "@/types/database"
import type { RoleType } from "@/types/enums"

/**
 * A casting as returned through the supabase-js client: snake_case columns
 * aliased to the camelCase Drizzle field names (see CASTING_SELECT), with
 * timestamptz columns delivered as ISO strings. See ProjectRow in projects.ts
 * for the rationale.
 */
export type CastingRow = Omit<Casting, "createdAt" | "updatedAt"> & {
  createdAt: string
  updatedAt: string
}

/** Aliased column list mapping snake_case DB columns to camelCase fields. */
const CASTING_SELECT =
  "id, projectId:project_id, title, description, roleType:role_type, ageMin:age_min, ageMax:age_max, location, shootDate:shoot_date, spotsAvailable:spots_available, status, createdAt:created_at, updatedAt:updated_at"

export type CastingActionResult =
  | { success: true; casting: CastingRow }
  | { success: false; error: string }

export type CastingMutationResult = { success: true } | { success: false; error: string }

export type CastingFilters = {
  location?: string
  roleType?: RoleType
  /** Exact shoot date, as a `YYYY-MM-DD` string. */
  date?: string
  /** Only castings whose [ageMin, ageMax] range includes this age (nulls are unbounded). */
  age?: number
}

const GENERIC_ERROR = "Une erreur est survenue. Réessayez."
const OWNERSHIP_ERROR = "Casting introuvable ou accès refusé."

function toRow(input: CastingInput) {
  return {
    title: input.title,
    description: nullableText(input.description),
    role_type: input.roleType,
    age_min: input.ageMin ?? null,
    age_max: input.ageMax ?? null,
    location: nullableText(input.location),
    shoot_date: input.shootDate ? toDateString(input.shootDate) : null,
    spots_available: input.spotsAvailable,
  }
}

/**
 * Create a casting under a project.
 *
 * RLS's `castings_manage_own_project` policy checks `owns_project(project_id)`
 * as its WITH CHECK, so inserting under someone else's project is rejected by
 * Postgres itself (a hard error, unlike the silent zero-row filter on
 * update/delete) — mapped to a friendly ownership message below. The role
 * check guards the same gap as in createProject: ownership of the project
 * doesn't by itself imply the caller is a production.
 */
export async function createCasting(
  projectId: string,
  input: CastingInput
): Promise<CastingActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Vous devez être connecté." }
  }

  const role = await getUserRole(supabase, user.id)
  if (role !== "production" && role !== "admin") {
    return { success: false, error: "Seules les productions peuvent créer un casting." }
  }

  const parsed = castingSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." }
  }

  const { data, error } = await supabase
    .from("castings")
    .insert({ project_id: projectId, ...toRow(parsed.data) })
    .select(CASTING_SELECT)
    .single()

  if (error) {
    // 42501 = RLS WITH CHECK violation, i.e. inserting under a project the
    // caller doesn't own — expected, not reported. Anything else is a genuine failure.
    if (error.code !== "42501") {
      Sentry.captureException(error, { tags: { feature: "castings" }, extra: { step: "create" } })
    }
    return { success: false, error: error.code === "42501" ? OWNERSHIP_ERROR : GENERIC_ERROR }
  }
  if (!data) {
    return { success: false, error: GENERIC_ERROR }
  }

  revalidatePath(`/app/projets/${projectId}`)
  return { success: true, casting: data as CastingRow }
}

/**
 * Update a casting. Like projects, RLS silently filters out rows the caller
 * doesn't own via the project, so a missing row after update is the ownership
 * signal.
 */
export async function updateCasting(id: string, input: CastingInput): Promise<CastingActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Vous devez être connecté." }
  }

  const parsed = castingSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." }
  }

  const { data, error } = await supabase
    .from("castings")
    .update({ ...toRow(parsed.data), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(CASTING_SELECT)

  if (error) {
    Sentry.captureException(error, { tags: { feature: "castings" }, extra: { step: "update" } })
    return { success: false, error: GENERIC_ERROR }
  }
  const casting = data?.[0]
  if (!casting) {
    return { success: false, error: OWNERSHIP_ERROR }
  }

  revalidatePath(`/app/projets/${casting.projectId}`)
  return { success: true, casting: casting as CastingRow }
}

/** Close a casting (stops accepting applications). */
export async function closeCasting(id: string): Promise<CastingMutationResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Vous devez être connecté." }
  }

  const { data, error } = await supabase
    .from("castings")
    .update({ status: "closed", updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("projectId:project_id")

  if (error) {
    Sentry.captureException(error, { tags: { feature: "castings" }, extra: { step: "close" } })
    return { success: false, error: GENERIC_ERROR }
  }
  const casting = data?.[0] as { projectId: string } | undefined
  if (!casting) {
    return { success: false, error: OWNERSHIP_ERROR }
  }

  revalidatePath(`/app/projets/${casting.projectId}`)
  return { success: true }
}

/**
 * Open castings for the public catalogue and in-app browsing.
 *
 * RLS's `castings_manage_own_project` policy grants a production unrestricted
 * visibility into its own castings regardless of status — correct for their
 * own management views, but this action must stay "public" even when called
 * by an authenticated production (e.g. nothing stops one from opening
 * /app/castings, which isn't role-gated). The explicit inner join re-asserts
 * the open-project condition independently of who's asking, instead of
 * relying on RLS alone for this specific guarantee.
 */
export async function getPublicCastings(filters?: CastingFilters): Promise<CastingRow[]> {
  const supabase = await createClient()
  let query = supabase
    .from("castings")
    .select(`${CASTING_SELECT}, projects!inner(status)`)
    .eq("status", "open")
    .eq("projects.status", "open")

  if (filters?.location) {
    query = query.ilike("location", `%${filters.location}%`)
  }
  if (filters?.roleType) {
    query = query.eq("role_type", filters.roleType)
  }
  if (filters?.date) {
    query = query.eq("shoot_date", filters.date)
  }
  // Guarded numeric coercion: `age` feeds a raw PostgREST filter string below,
  // so it must be a finite integer before interpolation.
  if (typeof filters?.age === "number" && Number.isFinite(filters.age)) {
    const age = Math.trunc(filters.age)
    query = query.or(`age_min.is.null,age_min.lte.${age}`).or(`age_max.is.null,age_max.gte.${age}`)
  }

  const { data, error } = await query.order("shoot_date", { ascending: true })
  if (error) {
    Sentry.captureException(error, { tags: { feature: "castings" }, extra: { step: "public" } })
  }
  return ((data ?? []) as Array<CastingRow & { projects: unknown }>).map(
    ({ projects: _projects, ...casting }) => casting
  )
}

/** Castings belonging to a project, for the project detail page. */
export async function getCastingsByProject(projectId: string): Promise<CastingRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("castings")
    .select(CASTING_SELECT)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  if (error) {
    Sentry.captureException(error, { tags: { feature: "castings" }, extra: { step: "by-project" } })
  }
  return (data as CastingRow[] | null) ?? []
}

/** The parent project fields shown alongside a casting on its detail page. */
export type CastingParentProject = {
  id: string
  title: string
  description: string | null
  shootLocation: string | null
  shootDateStart: string | null
  shootDateEnd: string | null
}

export type CastingDetailRow = CastingRow & { project: CastingParentProject }

/**
 * A single open casting (inside an open project) plus its parent project, for
 * the public/authenticated detail + application page.
 *
 * The `projects!inner` embed both pulls the parent fields and, via RLS on the
 * projects table (`projects_select_open`), re-asserts that the project is open
 * — a closed/draft project's castings are never applyable here regardless of
 * who asks. Returns null when the casting isn't open or doesn't exist.
 */
export async function getCastingDetail(id: string): Promise<CastingDetailRow | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("castings")
    .select(
      `${CASTING_SELECT}, projects!inner(id, title, description, shootLocation:shoot_location, shootDateStart:shoot_date_start, shootDateEnd:shoot_date_end)`
    )
    .eq("id", id)
    .eq("status", "open")
    .eq("projects.status", "open")
    .maybeSingle()

  if (!data) {
    return null
  }
  // supabase-js (untyped schema) infers the `projects` embed as an array, but a
  // many-to-one relationship returns a single object at runtime — hence the
  // cast through unknown.
  const { projects, ...casting } = data as unknown as CastingRow & {
    projects: CastingParentProject
  }
  return { ...casting, project: projects }
}
