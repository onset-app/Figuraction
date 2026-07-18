import { z } from "zod"
import { type RoleType, roleTypes } from "@/types/enums"
import { optionalDate, optionalNumber } from "./shared"

// Re-exported so form components can keep importing the list alongside the
// schema; the canonical definition lives in @/types/enums.
export { roleTypes }

export const ROLE_TYPE_LABELS: Record<RoleType, string> = {
  figurant: "Figurant",
  acteur: "Acteur",
  doublure: "Doublure",
}

export const castingSchema = z
  .object({
    title: z.string().trim().min(1, "Le titre est requis").max(200),
    description: z.string().trim().max(5000).optional(),
    roleType: z.enum(roleTypes, { message: "Veuillez choisir un type de rôle" }),
    ageMin: optionalNumber(z.coerce.number().int().min(0).max(120)),
    ageMax: optionalNumber(z.coerce.number().int().min(0).max(120)),
    location: z.string().trim().max(200).optional(),
    shootDate: optionalDate,
    spotsAvailable: z.coerce
      .number()
      .int("Le nombre de places doit être un nombre entier")
      .min(1, "Au moins 1 place est requise"),
  })
  .refine(
    // Explicit undefined checks: `!ageMin` would also skip validation for a
    // legitimate 0 (e.g. { ageMin: 5, ageMax: 0 } must fail, not pass).
    (data) => data.ageMin === undefined || data.ageMax === undefined || data.ageMax >= data.ageMin,
    {
      message: "L'âge maximum doit être supérieur ou égal à l'âge minimum",
      path: ["ageMax"],
    }
  )

export type CastingInput = z.infer<typeof castingSchema>
