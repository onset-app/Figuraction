"use server"

import { revalidatePath } from "next/cache"
import { getUserRole } from "@/lib/supabase/roles"
import { createClient } from "@/lib/supabase/server"
import { nullableText, toDateString } from "@/lib/utils"
import { type ProjectInput, projectSchema } from "@/schemas/project"
import type { Project } from "@/types/database"
import type { ApplicationStatus } from "@/types/enums"

/**
 * A project as returned through the supabase-js client: column names aliased
 * back to the camelCase Drizzle field names (see PROJECT_SELECT), and the
 * timestamptz columns delivered as ISO strings rather than Date objects.
 * Same approach as use-current-user.ts — the raw client returns snake_case
 * strings, so the Drizzle row type would be doubly inaccurate here.
 */
export type ProjectRow = Omit<Project, "createdAt" | "updatedAt"> & {
  createdAt: string
  updatedAt: string
}

/** Aliased column list mapping snake_case DB columns to camelCase fields. */
const PROJECT_SELECT =
  "id, productionId:production_id, title, description, shootLocation:shoot_location, shootDateStart:shoot_date_start, shootDateEnd:shoot_date_end, status, createdAt:created_at, updatedAt:updated_at"

export type ProjectActionResult =
  | { success: true; project: ProjectRow }
  | { success: false; error: string }

export type ProjectMutationResult = { success: true } | { success: false; error: string }

const GENERIC_ERROR = "Une erreur est survenue. Réessayez."
const OWNERSHIP_ERROR = "Projet introuvable ou accès refusé."

function toRow(input: ProjectInput) {
  return {
    title: input.title,
    description: nullableText(input.description),
    shoot_location: nullableText(input.shootLocation),
    shoot_date_start: input.shootDateStart ? toDateString(input.shootDateStart) : null,
    shoot_date_end: input.shootDateEnd ? toDateString(input.shootDateEnd) : null,
  }
}

/**
 * Create a new project owned by the current user.
 *
 * RLS's `projects_manage_own` policy only checks that `production_id` matches
 * the caller, not their role — a figurant could otherwise insert a project
 * under their own id. The role check below is the real gate against that.
 */
export async function createProject(input: ProjectInput): Promise<ProjectActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Vous devez être connecté." }
  }

  const role = await getUserRole(supabase, user.id)
  if (role !== "production" && role !== "admin") {
    return { success: false, error: "Seules les productions peuvent créer un projet." }
  }

  const parsed = projectSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." }
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({ production_id: user.id, ...toRow(parsed.data) })
    .select(PROJECT_SELECT)
    .single()

  if (error || !data) {
    return { success: false, error: GENERIC_ERROR }
  }

  revalidatePath("/app/projets")
  return { success: true, project: data as ProjectRow }
}

/**
 * Update a project. RLS's `projects_manage_own` policy silently filters out
 * rows the caller doesn't own (no error, just zero rows affected), so a
 * missing row after update is how ownership is verified here.
 */
export async function updateProject(id: string, input: ProjectInput): Promise<ProjectActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Vous devez être connecté." }
  }

  const parsed = projectSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." }
  }

  const { data, error } = await supabase
    .from("projects")
    .update({ ...toRow(parsed.data), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(PROJECT_SELECT)

  if (error) {
    return { success: false, error: GENERIC_ERROR }
  }
  const project = data?.[0]
  if (!project) {
    return { success: false, error: OWNERSHIP_ERROR }
  }

  revalidatePath("/app/projets")
  revalidatePath(`/app/projets/${id}`)
  return { success: true, project: project as ProjectRow }
}

/** Archive a project (soft-delete — projects are never hard-deleted). */
export async function deleteProject(id: string): Promise<ProjectMutationResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Vous devez être connecté." }
  }

  const { data, error } = await supabase
    .from("projects")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()

  if (error) {
    return { success: false, error: GENERIC_ERROR }
  }
  if (!data || data.length === 0) {
    return { success: false, error: OWNERSHIP_ERROR }
  }

  revalidatePath("/app/projets")
  return { success: true }
}

/**
 * Fetch a single project the current user owns.
 *
 * Scoped to the owner (like getMyProjects) rather than relying on RLS alone:
 * `projects_select_open` would otherwise let a production open another
 * production's *open* project in this management view. Admin oversight is a
 * separate back-office ticket. Returns null when not found or not owned.
 */
export async function getProject(id: string): Promise<ProjectRow | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return null
  }

  const { data } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("id", id)
    .eq("production_id", user.id)
    .maybeSingle()

  return (data as ProjectRow | null) ?? null
}

/** A project row plus its total casting count, for the project list. */
export type ProjectListItem = ProjectRow & { castingsCount: number }

/**
 * List every project owned by the current production, any status, with the
 * number of castings under each. Uses PostgREST's embedded-resource count
 * aggregate (`castings(count)`) instead of a per-project follow-up query.
 */
export async function getMyProjects(): Promise<ProjectListItem[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  const { data } = await supabase
    .from("projects")
    .select(`${PROJECT_SELECT}, castings(count)`)
    .eq("production_id", user.id)
    .order("created_at", { ascending: false })

  return ((data ?? []) as Array<ProjectRow & { castings: Array<{ count: number }> }>).map(
    ({ castings, ...project }) => ({
      ...project,
      castingsCount: castings?.[0]?.count ?? 0,
    })
  )
}

/** A candidate (application + applicant profile) under one of a project's castings. */
export type ProjectCandidate = {
  id: string
  status: ApplicationStatus
  message: string | null
  createdAt: string
  casting: { id: string; title: string }
  figurant: {
    id: string
    firstName: string
    lastName: string
    age: number | null
    city: string | null
    photoUrl: string | null
  } | null
}

/**
 * Every application to the castings of a given project, with the applicant's
 * profile, for the production's candidate-review view.
 *
 * Relies on RLS rather than an explicit ownership check: `applications_select_production`
 * (owns_casting) only returns applications on castings the caller owns, and
 * `profiles_select_figurants_by_staff` lets a production read figurant profiles.
 * A production passing another production's projectId therefore gets an empty
 * list. `castings!inner` scopes to this project; the `profiles!figurant_id`
 * hint disambiguates the two applications→profiles FKs (figurant_id vs
 * reviewed_by). Withdrawn applications are excluded — they aren't actionable.
 */
export async function getProjectCandidates(projectId: string): Promise<ProjectCandidate[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  const { data } = await supabase
    .from("applications")
    .select(
      "id, status, message, createdAt:created_at, castings!inner(id, title, project_id), figurant:profiles!figurant_id(id, firstName:first_name, lastName:last_name, age, city, photoUrl:photo_url)"
    )
    .eq("castings.project_id", projectId)
    .neq("status", "withdrawn")
    .order("created_at", { ascending: false })

  // supabase-js infers the to-one embeds as arrays; both are single objects at
  // runtime (figurant may be null if the profile row was removed).
  return (
    (data ?? []) as unknown as Array<
      Omit<ProjectCandidate, "casting" | "figurant"> & {
        castings: { id: string; title: string }
        figurant: ProjectCandidate["figurant"]
      }
    >
  ).map(({ castings, figurant, ...application }) => ({
    ...application,
    casting: { id: castings.id, title: castings.title },
    figurant: figurant ?? null,
  }))
}
