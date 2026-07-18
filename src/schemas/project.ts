import { z } from "zod"
import type { ProjectStatus } from "@/types/enums"
import { optionalDate } from "./shared"

/** French labels for each project status, shared by badges, filters and lists. */
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Brouillon",
  open: "Ouvert",
  closed: "Fermé",
  archived: "Archivé",
}

/**
 * Allowed manual status transitions (publish / close / reopen / archive).
 * Single source of truth for the `updateProjectStatus` action's validation
 * and the buttons offered on the project detail page. Archiving replaces
 * hard deletion; archived is terminal.
 */
export const PROJECT_STATUS_TRANSITIONS: Record<ProjectStatus, ReadonlyArray<ProjectStatus>> = {
  draft: ["open"],
  open: ["closed"],
  closed: ["open", "archived"],
  archived: [],
}

export const projectSchema = z
  .object({
    title: z.string().trim().min(1, "Le titre est requis").max(200),
    description: z.string().trim().max(5000).optional(),
    shootLocation: z.string().trim().max(200).optional(),
    shootDateStart: optionalDate,
    shootDateEnd: optionalDate,
  })
  .refine(
    (data) =>
      !data.shootDateStart || !data.shootDateEnd || data.shootDateEnd >= data.shootDateStart,
    {
      message: "La date de fin doit être après la date de début",
      path: ["shootDateEnd"],
    }
  )

export type ProjectInput = z.infer<typeof projectSchema>
