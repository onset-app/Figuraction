"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"
import { createCarpool } from "@/actions/carpools"
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
import {
  type CarpoolInput,
  CONTACT_METHOD_LABELS,
  carpoolSchema,
  contactMethods,
} from "@/schemas/carpool"

// departureDate (coerce.date) and seatsAvailable (coerce.number) differ between
// input and output shapes — same z.input/z.output split as the other forms.
type CarpoolFormValues = z.input<typeof carpoolSchema>

const NO_PROJECT = "none"

export function CarpoolForm({
  projects,
  defaultDriverName,
  onSuccess,
}: {
  projects: Array<{ id: string; title: string }>
  defaultDriverName: string
  onSuccess: () => void
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CarpoolFormValues, unknown, CarpoolInput>({
    resolver: zodResolver(carpoolSchema),
    defaultValues: { driverName: defaultDriverName, seatsAvailable: 3 },
  })

  async function onSubmit(values: CarpoolInput) {
    const result = await createCarpool(values)
    if (result.success) {
      toast.success("Trajet publié.")
      reset({ driverName: defaultDriverName, seatsAvailable: 3 })
      onSuccess()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="driverName">Conducteur</Label>
          <Input id="driverName" {...register("driverName")} />
          {errors.driverName && (
            <p className="text-destructive text-sm">{errors.driverName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="project">Projet (optionnel)</Label>
          <Controller
            control={control}
            name="projectId"
            render={({ field }) => (
              <Select
                onValueChange={(value) => field.onChange(value === NO_PROJECT ? undefined : value)}
                value={field.value ?? NO_PROJECT}
              >
                <SelectTrigger id="project" className="w-full">
                  {/* Base UI's SelectValue renders the raw value (the sentinel
                      or a project UUID) unless mapped via a render-prop. */}
                  <SelectValue>
                    {(value: string | null) =>
                      !value || value === NO_PROJECT
                        ? "Aucun projet"
                        : (projects.find((p) => p.id === value)?.title ?? "Projet")
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PROJECT}>Aucun projet</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="departureArea">Lieu de départ</Label>
        <Input
          id="departureArea"
          placeholder="Bruxelles — Gare du Midi"
          {...register("departureArea")}
        />
        {errors.departureArea && (
          <p className="text-destructive text-sm">{errors.departureArea.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="departureDate">Date</Label>
          <Input id="departureDate" type="date" {...register("departureDate")} />
          {errors.departureDate && (
            <p className="text-destructive text-sm">{errors.departureDate.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="departureTime">Heure</Label>
          <Input id="departureTime" type="time" {...register("departureTime")} />
          {errors.departureTime && (
            <p className="text-destructive text-sm">{errors.departureTime.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="seatsAvailable">Places</Label>
          <Input id="seatsAvailable" type="number" min={1} {...register("seatsAvailable")} />
          {errors.seatsAvailable && (
            <p className="text-destructive text-sm">{errors.seatsAvailable.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contactMethod">Mode de contact</Label>
          <Controller
            control={control}
            name="contactMethod"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value ?? null}>
                <SelectTrigger id="contactMethod" className="w-full">
                  <SelectValue placeholder="Choisir">
                    {(value: string | null) =>
                      value ? CONTACT_METHOD_LABELS[value as (typeof contactMethods)[number]] : null
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {contactMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {CONTACT_METHOD_LABELS[method]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.contactMethod && (
            <p className="text-destructive text-sm">{errors.contactMethod.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactValue">Contact</Label>
          <Input id="contactValue" placeholder="Email ou téléphone" {...register("contactValue")} />
          {errors.contactValue && (
            <p className="text-destructive text-sm">{errors.contactValue.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Publication…" : "Publier le trajet"}
      </Button>
    </form>
  )
}
