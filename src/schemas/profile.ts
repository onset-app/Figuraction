import { z } from "zod"
import { type ExperienceLevel, experienceLevels } from "@/types/enums"
import { optionalNumber } from "./shared"

// Re-exported so form components can keep importing the list alongside the
// schema; the canonical definition lives in @/types/enums.
export { experienceLevels }

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  debutant: "Débutant",
  premiere_fois: "Première fois",
  confirme: "Confirmé",
}

/** Narrow a DB value (nullable free-form text) to a known experience level. */
export function isExperienceLevel(value: string | null | undefined): value is ExperienceLevel {
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
  city: z.string().trim().max(100).optional(),
  age: optionalNumber(
    z.coerce
      .number()
      .int("L'âge doit être un nombre entier")
      .min(16, "L'âge minimum est de 16 ans")
      .max(120, "Âge invalide")
  ),
  bio: z.string().trim().max(2000, "La bio ne peut pas dépasser 2000 caractères").optional(),
  // Optional: the profile form only shows this to figurants — a production
  // must be able to save its profile without picking an acting-experience level.
  experience: z
    .enum(experienceLevels, { message: "Veuillez choisir un niveau d'expérience" })
    .optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>
