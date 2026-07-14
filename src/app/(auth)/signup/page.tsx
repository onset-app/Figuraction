"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { signup } from "@/actions/auth"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type SignupInput, signupSchema } from "@/schemas/auth"

export default function SignupPage() {
  const [formError, setFormError] = useState<string | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) })

  async function onSubmit(values: SignupInput) {
    setFormError(null)
    const result = await signup(values)
    if (result.success) {
      setSubmittedEmail(values.email)
    } else {
      setFormError(result.error)
    }
  }

  if (submittedEmail) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Vérifiez votre email</CardTitle>
          <CardDescription>
            Un email de confirmation a été envoyé à <strong>{submittedEmail}</strong>. Cliquez sur
            le lien qu'il contient pour activer votre compte.
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
        <CardTitle>Créer mon compte</CardTitle>
        <CardDescription>Rejoignez ONSET en quelques secondes.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" autoComplete="given-name" {...register("firstName")} />
              {errors.firstName && (
                <p className="text-destructive text-sm">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" autoComplete="family-name" {...register("lastName")} />
              {errors.lastName && (
                <p className="text-destructive text-sm">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Je suis…</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Choisir un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="figurant">Figurant</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && <p className="text-destructive text-sm">{errors.role.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
            )}
          </div>

          {formError && <p className="text-destructive text-sm">{formError}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Création…" : "Créer mon compte"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-muted-foreground text-sm">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-foreground underline underline-offset-4">
            Se connecter
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
