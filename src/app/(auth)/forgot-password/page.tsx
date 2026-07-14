"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { resetPassword } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type ResetPasswordInput, resetPasswordSchema } from "@/schemas/auth"

export default function ForgotPasswordPage() {
  const [formError, setFormError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) })

  async function onSubmit(values: ResetPasswordInput) {
    setFormError(null)
    const result = await resetPassword(values)
    if (result.success) {
      setSubmitted(true)
    } else {
      setFormError(result.error)
    }
  }

  if (submitted) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Email envoyé</CardTitle>
          <CardDescription>
            Si un compte est associé à cette adresse, vous recevrez un lien pour réinitialiser votre
            mot de passe.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href="/login" className="text-sm underline underline-offset-4">
            Retour à la connexion
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Mot de passe oublié</CardTitle>
        <CardDescription>
          Saisissez votre email pour recevoir un lien de réinitialisation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
          </div>

          {formError && <p className="text-destructive text-sm">{formError}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Envoi…" : "Envoyer le lien"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <Link href="/login" className="text-muted-foreground text-sm underline underline-offset-4">
          Retour à la connexion
        </Link>
      </CardFooter>
    </Card>
  )
}
