import { z } from "zod"
import { optionalDate, optionalNumber } from "./shared"

export const roleTypes = ["figurant", "acteur", "doublure"] as const

export const castingSchema = z
  .object({
    title: z.string().trim().min(1, "Le titre est requis").max(200),
    description: z.string().trim().max(5000).optional().or(z.literal("")),
    roleType: z.enum(roleTypes, { message: "Veuillez choisir un type de rôle" }),
    ageMin: optionalNumber(z.coerce.number().int().min(0).max(120)),
    ageMax: optionalNumber(z.coerce.number().int().min(0).max(120)),
    location: z.string().trim().max(200).optional().or(z.literal("")),
    shootDate: optionalDate,
    spotsAvailable: z.coerce
      .number()
      .int("Le nombre de places doit être un nombre entier")
      .min(1, "Au moins 1 place est requise"),
  })
  .refine((data) => !data.ageMin || !data.ageMax || data.ageMax >= data.ageMin, {
    message: "L'âge maximum doit être supérieur ou égal à l'âge minimum",
    path: ["ageMax"],
  })

export type CastingInput = z.infer<typeof castingSchema>
