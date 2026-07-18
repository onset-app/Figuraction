import { z } from "zod"

/**
 * Details a production fills in to send a convocation to the confirmed
 * figurants of a project. The recipient list is derived server-side (never
 * client-supplied), so this schema only covers the shoot logistics.
 */
export const convocationSchema = z.object({
  projectId: z.uuid(),
  location: z.string().trim().min(1, "Le lieu est requis").max(200),
  address: z.string().trim().min(1, "L'adresse est requise").max(300),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Heure invalide (format HH:MM)"),
  instructions: z.string().trim().min(1, "Les consignes sont requises").max(2000),
  contactName: z.string().trim().min(1, "Le nom du contact est requis").max(100),
  contactPhone: z
    .string()
    .trim()
    .regex(/^[+0-9\s.()-]{6,20}$/, "Numéro de téléphone invalide"),
})

export type ConvocationInput = z.infer<typeof convocationSchema>
