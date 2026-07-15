"use client"

import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { RoleGuard } from "@/components/layout/role-guard"
import { CastingCard } from "@/components/projets/casting-card"
import { CastingForm } from "@/components/projets/casting-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { projectCastingsQueryKey, useProjectCastings } from "@/hooks/use-castings"
import { MY_PROJECTS_QUERY_KEY, useProject } from "@/hooks/use-projects"
import type { ProjectStatus } from "@/types/enums"

const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Brouillon",
  open: "Ouvert",
  closed: "Fermé",
  archived: "Archivé",
}

const STATUS_VARIANTS: Record<ProjectStatus, "default" | "outline" | "secondary" | "ghost"> = {
  draft: "outline",
  open: "default",
  closed: "secondary",
  archived: "ghost",
}

/** Format a `YYYY-MM-DD` string as `DD/MM/YYYY` without Date/timezone conversion. */
function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-")
  return `${day}/${month}/${year}`
}

function formatDateRange(start: string | null, end: string | null): string | null {
  if (!start && !end) return null
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`
  return formatDate(start ?? (end as string))
}

function ProjectDetail({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()
  const { data: project, isLoading } = useProject(projectId)
  const { data: castings, isLoading: castingsLoading } = useProjectCastings(projectId)
  const [dialogOpen, setDialogOpen] = useState(false)

  function invalidateAfterCastingChange() {
    queryClient.invalidateQueries({ queryKey: projectCastingsQueryKey(projectId) })
    // The project list shows a per-project casting count.
    queryClient.invalidateQueries({ queryKey: MY_PROJECTS_QUERY_KEY })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <Link
          href="/app/projets"
          className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Retour aux projets
        </Link>
        <p className="text-muted-foreground">Projet introuvable.</p>
      </div>
    )
  }

  const status = (project.status as ProjectStatus) ?? "draft"
  const dateRange = formatDateRange(project.shootDateStart, project.shootDateEnd)

  return (
    <div className="space-y-6">
      <Link
        href="/app/projets"
        className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Retour aux projets
      </Link>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-2xl">{project.title}</h1>
          <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
        </div>
        {project.description && <p className="text-muted-foreground">{project.description}</p>}
        <div className="flex flex-wrap gap-x-4 text-muted-foreground text-sm">
          {project.shootLocation && <span>{project.shootLocation}</span>}
          {dateRange && <span>{dateRange}</span>}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Castings</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm">
                <Plus className="size-4" /> Ajouter un casting
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau casting</DialogTitle>
            </DialogHeader>
            <CastingForm
              projectId={projectId}
              onSuccess={() => {
                invalidateAfterCastingChange()
                setDialogOpen(false)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {castingsLoading ? (
        <p className="text-muted-foreground text-sm">Chargement…</p>
      ) : !castings || castings.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Aucun casting pour ce projet. Ajoutez-en un pour commencer à recevoir des candidatures.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {castings.map((casting) => (
            <CastingCard
              key={casting.id}
              casting={casting}
              onChanged={invalidateAfterCastingChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProjetDetailPage() {
  const params = useParams<{ id: string }>()

  return (
    <RoleGuard allow={["production", "admin"]}>
      <ProjectDetail projectId={params.id} />
    </RoleGuard>
  )
}
