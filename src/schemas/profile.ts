import { z } from "zod"
import { optionalNumber } from "./shared"

export const experienceLevels = ["debutant", "premiere_fois", "confirme"] as const

export const EXPERIENCE_LABELS: Record<(typeof experienceLevels)[number], string> = {
  debutant: "Débutant",
  premiere_fois: "Première fois",
  confirme: "Confirmé",
}

/** Narrow a DB value (nullable free-form text) to a known experience level. */
export function isExperienceLevel(
  value: string | null | undefined
): value is (typeof experienceLevels)[number] {
  return !!value && (experienceLevels as readonly string[]).includes(value)
}

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis").max(100),
  lastName: z.string().trim().min(1, "Le nom est requis").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9\s.()-]{6,20}$/, "Numéro de téléphone invalide")
    .optional()
    .or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  age: optionalNumber(
    z.coerce
      .number()
      .int("L'âge doit être un nombre entier")
      .min(16, "L'âge minimum est de 16 ans")
      .max(120, "Âge invalide")
  ),
  bio: z.string().trim().max(2000, "La bio ne peut pas dépasser 2000 caractères").optional(),
  experience: z.enum(experienceLevels, {
    message: "Veuillez choisir un niveau d'expérience",
  }),
})

export type ProfileInput = z.infer<typeof profileSchema>
