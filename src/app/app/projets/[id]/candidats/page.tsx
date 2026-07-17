"use client"

import { ArrowLeft, Check, Loader2, Users, X } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useMemo, useState } from "react"
import type { ReviewStatus } from "@/actions/applications"
import type { ProjectCandidate } from "@/actions/projects"
import { RoleGuard } from "@/components/layout/role-guard"
import { CandidateList } from "@/components/projets/candidate-list"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { useProjectCandidates, useReviewApplications } from "@/hooks/use-applications"
import { useProject } from "@/hooks/use-projects"

type CastingGroup = { id: string; title: string; candidates: ProjectCandidate[] }

/** Group candidates by their casting, preserving the query's ordering. */
function groupByCasting(candidates: ProjectCandidate[]): CastingGroup[] {
  const groups = new Map<string, CastingGroup>()
  for (const candidate of candidates) {
    const existing = groups.get(candidate.casting.id)
    if (existing) {
      existing.candidates.push(candidate)
    } else {
      groups.set(candidate.casting.id, {
        id: candidate.casting.id,
        title: candidate.casting.title,
        candidates: [candidate],
      })
    }
  }
  return [...groups.values()]
}

function ProjectCandidates({ projectId }: { projectId: string }) {
  const { data: project } = useProject(projectId)
  const { data: candidates, isLoading } = useProjectCandidates(projectId)
  const review = useReviewApplications(projectId)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const groups = useMemo(() => groupByCasting(candidates ?? []), [candidates])

  function handleReview(ids: string[], status: ReviewStatus) {
    review.mutate(
      { ids, status },
      {
        onSuccess: () =>
          setSelectedIds((prev) => {
            const next = new Set(prev)
            for (const id of ids) {
              next.delete(id)
            }
            return next
          }),
      }
    )
  }

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleGroup(ids: string[], select: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      for (const id of ids) {
        if (select) {
          next.add(id)
        } else {
          next.delete(id)
        }
      }
      return next
    })
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/app/projets/${projectId}`}
        className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Retour au projet
      </Link>

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-bold text-2xl">Candidats{project ? ` — ${project.title}` : ""}</h1>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-3">
          <span className="text-sm">
            {selectedIds.size} sélectionné{selectedIds.size !== 1 ? "s" : ""}
          </span>
          <div className="ml-auto flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={review.isPending}
              onClick={() => handleReview([...selectedIds], "confirmed")}
            >
              <Check className="size-4" /> Confirmer
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={review.isPending}
              onClick={() => handleReview([...selectedIds], "rejected")}
            >
              <X className="size-4" /> Refuser
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucune candidature pour ce projet."
          description="Les candidatures apparaîtront ici dès que des figurants postuleront à vos castings."
        />
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <CandidateList
              key={group.id}
              castingTitle={group.title}
              candidates={group.candidates}
              selectedIds={selectedIds}
              onToggle={toggle}
              onToggleGroup={toggleGroup}
              onReview={handleReview}
              isReviewing={review.isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProjetCandidatsPage() {
  const params = useParams<{ id: string }>()

  return (
    <RoleGuard allow={["production", "admin"]}>
      <ProjectCandidates projectId={params.id} />
    </RoleGuard>
  )
}
