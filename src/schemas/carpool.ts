import { z } from "zod"

export const contactMethods = ["email", "phone"] as const

export const carpoolSchema = z
  .object({
    projectId: z.string().uuid().optional(),
    driverName: z.string().trim().min(1, "Le nom du conducteur est requis").max(100),
    departureArea: z.string().trim().min(1, "La zone de départ est requise").max(200),
    departureDate: z.coerce.date({ message: "Date de départ invalide" }),
    departureTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Heure invalide (format HH:MM)"),
    seatsAvailable: z.coerce
      .number()
      .int("Le nombre de places doit être un nombre entier")
      .min(0, "Le nombre de places ne peut pas être négatif"),
    contactMethod: z.enum(contactMethods, { message: "Veuillez choisir un mode de contact" }),
    contactValue: z.string().trim().min(1, "Le contact est requis"),
  })
  .superRefine((data, ctx) => {
    if (
      data.contactMethod === "email" &&
      !z.string().email().safeParse(data.contactValue).success
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Email invalide",
        path: ["contactValue"],
      })
    }
    if (data.contactMethod === "phone" && !/^[+0-9\s.()-]{6,20}$/.test(data.contactValue)) {
      ctx.addIssue({
        code: "custom",
        message: "Numéro de téléphone invalide",
        path: ["contactValue"],
      })
    }
  })

export type CarpoolInput = z.infer<typeof carpoolSchema>
