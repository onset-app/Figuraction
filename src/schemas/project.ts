import { z } from "zod"
import { optionalDate } from "./shared"

export const projectSchema = z
  .object({
    title: z.string().trim().min(1, "Le titre est requis").max(200),
    description: z.string().trim().max(5000).optional().or(z.literal("")),
    shootLocation: z.string().trim().max(200).optional().or(z.literal("")),
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
