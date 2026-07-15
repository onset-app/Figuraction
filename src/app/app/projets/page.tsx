"use client"

import { FolderKanban } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { RoleGuard } from "@/components/layout/role-guard"
import { ProjectCard } from "@/components/projets/project-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { useProjects } from "@/hooks/use-projects"
import type { ProjectStatus } from "@/types/enums"

const STATUS_FILTERS: ReadonlyArray<{ value: ProjectStatus | "all"; label: string }> = [
  { value: "all", label: "Tous" },
  { value: "draft", label: "Brouillon" },
  { value: "open", label: "Ouvert" },
  { value: "closed", label: "Fermé" },
  { value: "archived", label: "Archivé" },
]

function ProjetsList() {
  const { data: projects, isLoading } = useProjects()
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all")

  const filtered = (projects ?? []).filter(
    (project) => statusFilter === "all" || project.status === statusFilter
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(({ value, label }) => (
            <Button
              key={value}
              size="sm"
              variant={statusFilter === value ? "default" : "outline"}
              onClick={() => setStatusFilter(value)}
            >
              {label}
            </Button>
          ))}
        </div>
        <Link href="/app/projets/nouveau" className={buttonVariants({ variant: "default" })}>
          Nouveau projet
        </Link>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Chargement…</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <FolderKanban className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">
            {statusFilter === "all"
              ? "Aucun projet pour le moment."
              : "Aucun projet dans ce statut."}
          </p>
          {statusFilter === "all" && (
            <Link href="/app/projets/nouveau" className={buttonVariants({ variant: "outline" })}>
              Créer votre premier projet
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProjetsPage() {
  return (
    <RoleGuard allow={["production", "admin"]}>
      <ProjetsList />
    </RoleGuard>
  )
}
