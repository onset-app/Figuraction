"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"
import { createCasting } from "@/actions/castings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { type CastingInput, castingSchema, ROLE_TYPE_LABELS, roleTypes } from "@/schemas/casting"

// ageMin/ageMax/spotsAvailable (coerce.number) and shootDate (coerce.date)
// differ between input and output shapes — same z.input/z.output split as
// ProjectForm/ProfileForm.
type CastingFormValues = z.input<typeof castingSchema>

export function CastingForm({
  projectId,
  onSuccess,
}: {
  projectId: string
  onSuccess: () => void
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CastingFormValues, unknown, CastingInput>({
    resolver: zodResolver(castingSchema),
    defaultValues: { spotsAvailable: 1 },
  })

  async function onSubmit(values: CastingInput) {
    const result = await createCasting(projectId, values)
    if (result.success) {
      toast.success("Casting ajouté.")
      onSuccess()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="title">Titre</Label>
        <Input id="title" {...register("title")} />
        {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} {...register("description")} />
        {errors.description && (
          <p className="text-destructive text-sm">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="roleType">Type de rôle</Label>
          <Controller
            control={control}
            name="roleType"
            render={({ field }) => (
              // value ?? null keeps the Select controlled from first render
              // (field.value is undefined until a choice is made); null renders
              // the placeholder without tripping Base UI's controlled warning.
              <Select onValueChange={field.onChange} value={field.value ?? null}>
                <SelectTrigger id="roleType" className="w-full">
                  <SelectValue placeholder="Choisir un type">
                    {(value: string | null) =>
                      value ? ROLE_TYPE_LABELS[value as (typeof roleTypes)[number]] : null
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {roleTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {ROLE_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.roleType && <p className="text-destructive text-sm">{errors.roleType.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="spotsAvailable">Places</Label>
          <Input id="spotsAvailable" type="number" min={1} {...register("spotsAvailable")} />
          {errors.spotsAvailable && (
            <p className="text-destructive text-sm">{errors.spotsAvailable.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="ageMin">Âge min</Label>
          <Input id="ageMin" type="number" min={0} max={120} {...register("ageMin")} />
          {errors.ageMin && <p className="text-destructive text-sm">{errors.ageMin.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="ageMax">Âge max</Label>
          <Input id="ageMax" type="number" min={0} max={120} {...register("ageMax")} />
          {errors.ageMax && <p className="text-destructive text-sm">{errors.ageMax.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="location">Lieu</Label>
          <Input id="location" {...register("location")} />
          {errors.location && <p className="text-destructive text-sm">{errors.location.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="shootDate">Date de tournage</Label>
          <Input id="shootDate" type="date" {...register("shootDate")} />
          {errors.shootDate && (
            <p className="text-destructive text-sm">{errors.shootDate.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Ajout…" : "Ajouter le casting"}
      </Button>
    </form>
  )
}
