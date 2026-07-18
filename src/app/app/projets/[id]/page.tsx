"use client"

import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Loader2, Pencil, Plus, Users } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import type { CastingRow } from "@/actions/castings"
import { updateProjectStatus } from "@/actions/projects"
import { RoleGuard } from "@/components/layout/role-guard"
import { CastingCard } from "@/components/projets/casting-card"
import { CastingForm } from "@/components/projets/casting-form"
import { ProjectForm } from "@/components/projets/project-form"
import { ProjectStatusBadge } from "@/components/projets/project-status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { projectCastingsQueryKey, useProjectCastings } from "@/hooks/use-castings"
import { MY_PROJECTS_QUERY_KEY, projectQueryKey, useProject } from "@/hooks/use-projects"
import { formatDateRangeShortFr } from "@/lib/utils"
import type { ProjectStatus } from "@/types/enums"

/**
 * Buttons offered per current status. Each pair must be an allowed edge in
 * PROJECT_STATUS_TRANSITIONS (schemas/project.ts) — the server re-validates,
 * so a drift here surfaces as a rejected action, never a bad write.
 */
const STATUS_ACTIONS: ReadonlyArray<{
  from: ProjectStatus
  to: ProjectStatus
  label: string
  variant: "default" | "outline"
}> = [
  { from: "draft", to: "open", label: "Publier le projet", variant: "default" },
  { from: "open", to: "closed", label: "Fermer le projet", variant: "outline" },
  { from: "closed", to: "open", label: "Réouvrir", variant: "outline" },
  { from: "closed", to: "archived", label: "Archiver", variant: "outline" },
]

function ProjectDetail({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()
  const { data: project, isLoading } = useProject(projectId)
  const { data: castings, isLoading: castingsLoading } = useProjectCastings(projectId)
  const [addCastingOpen, setAddCastingOpen] = useState(false)
  const [editProjectOpen, setEditProjectOpen] = useState(false)
  const [editingCasting, setEditingCasting] = useState<CastingRow | null>(null)
  const [pendingStatus, setPendingStatus] = useState<ProjectStatus | null>(null)

  function invalidateProject() {
    queryClient.invalidateQueries({ queryKey: projectQueryKey(projectId) })
    queryClient.invalidateQueries({ queryKey: MY_PROJECTS_QUERY_KEY })
  }

  function invalidateAfterCastingChange() {
    queryClient.invalidateQueries({ queryKey: projectCastingsQueryKey(projectId) })
    // The project list shows a per-project casting count.
    queryClient.invalidateQueries({ queryKey: MY_PROJECTS_QUERY_KEY })
  }

  async function handleStatusChange(to: ProjectStatus) {
    setPendingStatus(to)
    const result = await updateProjectStatus(projectId, to)
    setPendingStatus(null)
    if (result.success) {
      toast.success("Statut mis à jour.")
      invalidateProject()
    } else {
      toast.error(result.error)
    }
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

  const dateRange = formatDateRangeShortFr(project.shootDateStart, project.shootDateEnd)
  const statusActions = STATUS_ACTIONS.filter(({ from }) => from === project.status)

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
          <ProjectStatusBadge status={project.status} />
        </div>
        {project.description && <p className="text-muted-foreground">{project.description}</p>}
        <div className="flex flex-wrap gap-x-4 text-muted-foreground text-sm">
          {project.shootLocation && <span>{project.shootLocation}</span>}
          {dateRange && <span>{dateRange}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {statusActions.map(({ to, label, variant }) => (
            <Button
              key={to}
              size="sm"
              variant={variant}
              disabled={pendingStatus !== null}
              onClick={() => handleStatusChange(to)}
            >
              {pendingStatus === to ? "Mise à jour…" : label}
            </Button>
          ))}
          <Dialog open={editProjectOpen} onOpenChange={setEditProjectOpen}>
            <DialogTrigger
              render={
                <Button size="sm" variant="outline">
                  <Pencil className="size-4" /> Modifier
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier le projet</DialogTitle>
              </DialogHeader>
              <ProjectForm project={project} onUpdated={() => setEditProjectOpen(false)} />
            </DialogContent>
          </Dialog>
          <Link
            href={`/app/projets/${projectId}/candidats`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Users className="size-4" /> Voir les candidats
          </Link>
        </div>
        {project.status === "draft" && (
          <p className="text-muted-foreground text-sm">
            Ce projet est en brouillon : ses castings ne sont pas visibles des figurants tant qu'il
            n'est pas publié.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Castings</h2>
        <Dialog open={addCastingOpen} onOpenChange={setAddCastingOpen}>
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
                setAddCastingOpen(false)
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
              onEdit={() => setEditingCasting(casting)}
            />
          ))}
        </div>
      )}

      <Dialog
        open={editingCasting !== null}
        onOpenChange={(open) => {
          if (!open) setEditingCasting(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le casting</DialogTitle>
          </DialogHeader>
          {editingCasting && (
            <CastingForm
              projectId={projectId}
              casting={editingCasting}
              onSuccess={() => {
                invalidateAfterCastingChange()
                setEditingCasting(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
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
