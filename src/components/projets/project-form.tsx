"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"
import { createProject, type ProjectRow, updateProject } from "@/actions/projects"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MY_PROJECTS_QUERY_KEY, projectQueryKey } from "@/hooks/use-projects"
import { type ProjectInput, projectSchema } from "@/schemas/project"

// shootDateStart/shootDateEnd use z.coerce.date(), so the pre-parse (input)
// shape differs from the post-parse (output) shape — same reasoning as
// ProfileForm's `age` field.
type ProjectFormValues = z.input<typeof projectSchema>

type ProjectFormProps = {
  /** When set, the form edits this project instead of creating a new one. */
  project?: ProjectRow
  /** Called after a successful update (edit mode only). */
  onUpdated?: () => void
}

export function ProjectForm({ project, onUpdated }: ProjectFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues, unknown, ProjectInput>({
    resolver: zodResolver(projectSchema),
    // Date columns arrive as YYYY-MM-DD strings, which is exactly what native
    // date inputs consume; "" renders an empty field (normalised by optionalDate).
    defaultValues: project
      ? {
          title: project.title,
          description: project.description ?? "",
          shootLocation: project.shootLocation ?? "",
          shootDateStart: project.shootDateStart ?? "",
          shootDateEnd: project.shootDateEnd ?? "",
        }
      : undefined,
  })

  async function onSubmit(values: ProjectInput) {
    if (project) {
      const result = await updateProject(project.id, values)
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: projectQueryKey(project.id) })
        queryClient.invalidateQueries({ queryKey: MY_PROJECTS_QUERY_KEY })
        toast.success("Projet mis à jour.")
        onUpdated?.()
      } else {
        toast.error(result.error)
      }
      return
    }

    const result = await createProject(values)
    if (result.success) {
      // The list page reads from the client query cache, which revalidatePath
      // (server-side) doesn't touch — invalidate it so the new project shows
      // immediately after the redirect instead of after staleTime expires.
      queryClient.invalidateQueries({ queryKey: MY_PROJECTS_QUERY_KEY })
      toast.success("Projet créé.")
      router.push("/app/projets")
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
        <Textarea id="description" rows={4} {...register("description")} />
        {errors.description && (
          <p className="text-destructive text-sm">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="shootLocation">Lieu de tournage</Label>
        <Input id="shootLocation" {...register("shootLocation")} />
        {errors.shootLocation && (
          <p className="text-destructive text-sm">{errors.shootLocation.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="shootDateStart">Date de début</Label>
          <Input id="shootDateStart" type="date" {...register("shootDateStart")} />
          {errors.shootDateStart && (
            <p className="text-destructive text-sm">{errors.shootDateStart.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="shootDateEnd">Date de fin</Label>
          <Input id="shootDateEnd" type="date" {...register("shootDateEnd")} />
          {errors.shootDateEnd && (
            <p className="text-destructive text-sm">{errors.shootDateEnd.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? project
            ? "Enregistrement…"
            : "Création…"
          : project
            ? "Enregistrer"
            : "Créer le projet"}
      </Button>
    </form>
  )
}
