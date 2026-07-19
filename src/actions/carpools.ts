"use server"

import * as Sentry from "@sentry/nextjs"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { toDateString } from "@/lib/utils"
import { type CarpoolInput, carpoolSchema } from "@/schemas/carpool"
import type { ContactMethod } from "@/types/enums"

const GENERIC_ERROR = "Une erreur est survenue. Réessayez."
const OWNERSHIP_ERROR = "Covoiturage introuvable ou accès refusé."

export type CarpoolActionResult = { success: true } | { success: false; error: string }

/** A carpool offer as shown on the covoiturage board, with its optional project title. */
export type CarpoolListItem = {
  id: string
  projectId: string | null
  projectTitle: string | null
  driverId: string
  driverName: string
  departureArea: string
  departureDate: string
  departureTime: string
  seatsAvailable: number
  // NOT NULL in the DB since the Sprint 1 hardening pass.
  contactMethod: ContactMethod
  contactValue: string
  isFull: boolean
  createdAt: string
}

const CARPOOL_SELECT =
  "id, projectId:project_id, driverId:driver_id, driverName:driver_name, departureArea:departure_area, departureDate:departure_date, departureTime:departure_time, seatsAvailable:seats_available, contactMethod:contact_method, contactValue:contact_value, isFull:is_full, createdAt:created_at, project:projects(title)"

/**
 * Every carpool offer, soonest departure first, with the linked project's title.
 *
 * Readable by any authenticated user (`carpools_select_all`). The project embed
 * resolves only for open projects (`projects_select_open`), so a carpool linked
 * to a non-open project simply shows no project name — acceptable here.
 */
export async function getCarpools(): Promise<CarpoolListItem[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("carpools")
    .select(CARPOOL_SELECT)
    .order("departure_date", { ascending: true })
    .order("departure_time", { ascending: true })

  if (error) {
    Sentry.captureException(error, { tags: { feature: "carpools" }, extra: { step: "list" } })
  }

  // supabase-js infers the to-one `project` embed as an array; it's an object
  // at runtime (or null when there's no project / it isn't visible).
  return (
    (data ?? []) as unknown as Array<
      Omit<CarpoolListItem, "projectTitle"> & { project: { title: string } | null }
    >
  ).map(({ project, ...carpool }) => ({ ...carpool, projectTitle: project?.title ?? null }))
}

/** Open projects (id + title) a carpool can be linked to, for the create form. */
export async function getOpenProjects(): Promise<Array<{ id: string; title: string }>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("projects")
    .select("id, title")
    .eq("status", "open")
    .order("title", { ascending: true })

  if (error) {
    Sentry.captureException(error, {
      tags: { feature: "carpools" },
      extra: { step: "open-projects" },
    })
  }
  return (data ?? []) as Array<{ id: string; title: string }>
}

/**
 * Publish a carpool offer for the current user.
 *
 * `driver_id` is taken from the session, never the client, and is what
 * `carpools_insert_own` checks. The date is normalised to `YYYY-MM-DD` for the
 * Postgres `date` column.
 */
export async function createCarpool(input: CarpoolInput): Promise<CarpoolActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Vous devez être connecté." }
  }

  const parsed = carpoolSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." }
  }

  const { error } = await supabase.from("carpools").insert({
    project_id: parsed.data.projectId ?? null,
    driver_id: user.id,
    driver_name: parsed.data.driverName,
    departure_area: parsed.data.departureArea,
    departure_date: toDateString(parsed.data.departureDate),
    departure_time: parsed.data.departureTime,
    seats_available: parsed.data.seatsAvailable,
    contact_method: parsed.data.contactMethod,
    contact_value: parsed.data.contactValue,
  })

  if (error) {
    Sentry.captureException(error, { tags: { feature: "carpools" }, extra: { step: "create" } })
    return { success: false, error: GENERIC_ERROR }
  }

  revalidatePath("/app/covoiturage")
  return { success: true }
}

/**
 * Set whether a carpool is full. A toggle rather than a one-way flag: when a
 * passenger cancels, the driver reopens the offer instead of deleting and
 * re-creating it. RLS's `carpools_update_own` scopes the update to the
 * caller's own offers, so a zero-row result means it wasn't theirs.
 */
export async function setCarpoolFull(id: string, isFull: boolean): Promise<CarpoolActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Vous devez être connecté." }
  }

  const { data, error } = await supabase
    .from("carpools")
    .update({ is_full: isFull === true })
    .eq("id", id)
    .select("id")

  if (error) {
    Sentry.captureException(error, { tags: { feature: "carpools" }, extra: { step: "set-full" } })
    return { success: false, error: GENERIC_ERROR }
  }
  if (!data || data.length === 0) {
    return { success: false, error: OWNERSHIP_ERROR }
  }

  revalidatePath("/app/covoiturage")
  return { success: true }
}

/**
 * Delete a carpool. RLS's `carpools_delete_own` restricts the delete to the
 * caller's own offers; a zero-row result means it wasn't theirs.
 */
export async function deleteCarpool(id: string): Promise<CarpoolActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Vous devez être connecté." }
  }

  const { data, error } = await supabase.from("carpools").delete().eq("id", id).select("id")

  if (error) {
    Sentry.captureException(error, { tags: { feature: "carpools" }, extra: { step: "delete" } })
    return { success: false, error: GENERIC_ERROR }
  }
  if (!data || data.length === 0) {
    return { success: false, error: OWNERSHIP_ERROR }
  }

  revalidatePath("/app/covoiturage")
  return { success: true }
}
