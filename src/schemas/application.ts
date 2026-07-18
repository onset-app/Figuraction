import { z } from "zod"

export const applicationSchema = z.object({
  castingId: z.uuid("Casting invalide"),
  message: z
    .string()
    .trim()
    .max(2000, "Le message ne peut pas dépasser 2000 caractères")
    .optional(),
})

export type ApplicationInput = z.infer<typeof applicationSchema>
