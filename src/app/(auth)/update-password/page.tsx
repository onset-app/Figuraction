"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { updatePassword } from "@/actions/auth"
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
import { createClient } from "@/lib/supabase/client"
import { type UpdatePasswordInput, updatePasswordSchema } from "@/schemas/auth"

/**
 * Reached from the recovery link via /auth/callback, which has already
 * exchanged the code for a session. The upfront session check catches expired
 * or re-used links immediately instead of only erroring on submit.
 */
export default function UpdatePasswordPage() {
  const [session, setSession] = useState<"checking" | "valid" | "missing">("checking")
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setSession(data.user ? "valid" : "missing")
    })
  }, [])

  async function onSubmit(values: UpdatePasswordInput) {
    setFormError(null)
    // On success the action redirects; depending on Next internals the awaited
    // promise then never yields a result — hence the optional access.
    const result = await updatePassword(values)
    if (result && !result.success) {
      setFormError(result.error)
    }
  }

  if (session === "checking") {
    return <p className="text-muted-foreground text-sm">Chargement…</p>
  }

  if (session === "missing") {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Lien expiré ou invalide</CardTitle>
          <CardDescription>
            Ce lien de réinitialisation n'est plus valide. Refaites une demande pour en recevoir un
            nouveau.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href="/forgot-password" className="text-sm underline underline-offset-4">
            Demander un nouveau lien
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Nouveau mot de passe</CardTitle>
        <CardDescription>Choisissez un nouveau mot de passe pour votre compte.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
            {isSubmitting ? "Mise à jour…" : "Mettre à jour"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
