import { z } from "zod"

export const signupSchema = z
  .object({
    firstName: z.string().trim().min(1, "Le prénom est requis").max(100),
    lastName: z.string().trim().min(1, "Le nom est requis").max(100),
    email: z.string().trim().min(1, "L'email est requis").email("Email invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
    role: z.enum(["figurant", "production"], {
      message: "Veuillez choisir un rôle",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

export type SignupInput = z.infer<typeof signupSchema>

export const loginSchema = z.object({
  email: z.string().trim().min(1, "L'email est requis").email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const resetPasswordSchema = z.object({
  email: z.string().trim().min(1, "L'email est requis").email("Email invalide"),
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export const updatePasswordSchema = z
  .object({
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
