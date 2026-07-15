"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"
import { updateProfile } from "@/actions/profiles"
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
import {
  EXPERIENCE_LABELS,
  experienceLevels,
  type ProfileInput,
  profileSchema,
} from "@/schemas/profile"

// `age` uses z.coerce.number(), so the pre-parse (input) shape differs from
// the post-parse (output) shape. Typing the form as input→output keeps
// react-hook-form's field values aligned with what the raw <input> produces
// while the submit handler still receives the coerced ProfileInput.
type ProfileFormValues = z.input<typeof profileSchema>

type ProfileFormProps = {
  defaultValues?: Partial<ProfileFormValues>
  onSuccess?: () => void
}

export function ProfileForm({ defaultValues, onSuccess }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues, unknown, ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  })

  async function onSubmit(values: ProfileInput) {
    const result = await updateProfile(values)
    if (result.success) {
      toast.success("Profil enregistré.")
      onSuccess?.()
    } else {
      toast.error(result.error)
    }
  }

  return (
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
          {errors.lastName && <p className="text-destructive text-sm">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
          {errors.phone && <p className="text-destructive text-sm">{errors.phone.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input id="city" autoComplete="address-level2" {...register("city")} />
          {errors.city && <p className="text-destructive text-sm">{errors.city.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="age">Âge</Label>
          <Input id="age" type="number" min={16} max={120} {...register("age")} />
          {errors.age && <p className="text-destructive text-sm">{errors.age.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="experience">Expérience</Label>
          <Controller
            control={control}
            name="experience"
            render={({ field }) => (
              // value ?? null keeps the Select controlled even when the profile
              // has no experience yet (undefined), avoiding Base UI's
              // uncontrolled→controlled warning.
              <Select onValueChange={field.onChange} value={field.value ?? null}>
                <SelectTrigger id="experience" className="w-full">
                  {/* Base UI's SelectValue renders the raw value as text unless
                      given a render-prop, so map it to the French label here. */}
                  <SelectValue placeholder="Choisir un niveau">
                    {(value: string | null) =>
                      value ? EXPERIENCE_LABELS[value as (typeof experienceLevels)[number]] : null
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {EXPERIENCE_LABELS[level]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.experience && (
            <p className="text-destructive text-sm">{errors.experience.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" rows={4} {...register("bio")} />
        {errors.bio && <p className="text-destructive text-sm">{errors.bio.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  )
}
