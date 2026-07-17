"use client"

import { Check, X } from "lucide-react"
import Link from "next/link"
import type { ReviewStatus } from "@/actions/applications"
import type { ProjectCandidate } from "@/actions/projects"
import { StatusBadge } from "@/components/shared/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

/**
 * Candidates for a single casting, with per-row and select-all checkboxes plus
 * confirm/reject actions. Selection is owned by the parent page (keyed by
 * application id) so the bulk bar can act across castings.
 */
export function CandidateList({
  castingTitle,
  candidates,
  selectedIds,
  onToggle,
  onToggleGroup,
  onReview,
  isReviewing,
}: {
  castingTitle: string
  candidates: ProjectCandidate[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onToggleGroup: (ids: string[], select: boolean) => void
  onReview: (ids: string[], status: ReviewStatus) => void
  isReviewing: boolean
}) {
  const groupIds = candidates.map((candidate) => candidate.id)
  const selectedCount = groupIds.filter((id) => selectedIds.has(id)).length
  const allSelected = selectedCount > 0 && selectedCount === groupIds.length
  const someSelected = selectedCount > 0 && !allSelected

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onCheckedChange={(checked) => onToggleGroup(groupIds, checked)}
          aria-label={`Sélectionner tous les candidats de ${castingTitle}`}
        />
        <h3 className="font-semibold">{castingTitle}</h3>
        <span className="text-muted-foreground text-sm">
          {candidates.length} candidat{candidates.length !== 1 ? "s" : ""}
        </span>
      </div>

      <ul className="divide-y rounded-lg border">
        {candidates.map((candidate) => {
          const { figurant } = candidate
          return (
            <li key={candidate.id} className="flex items-center gap-3 p-3">
              <Checkbox
                checked={selectedIds.has(candidate.id)}
                onCheckedChange={() => onToggle(candidate.id)}
                aria-label="Sélectionner ce candidat"
              />
              {figurant ? (
                <Link
                  href={`/app/candidats/${figurant.id}?application=${candidate.id}`}
                  className="flex flex-1 items-center gap-3 hover:underline"
                >
                  <Avatar>
                    {figurant.photoUrl && <AvatarImage src={figurant.photoUrl} alt="" />}
                    <AvatarFallback>
                      {initials(figurant.firstName, figurant.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {figurant.firstName} {figurant.lastName}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {[figurant.age != null ? `${figurant.age} ans` : null, figurant.city]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </Link>
              ) : (
                <span className="flex-1 text-muted-foreground text-sm">Profil indisponible</span>
              )}
              <StatusBadge status={candidate.status} />
              <div className="flex gap-1">
                {candidate.status !== "confirmed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isReviewing}
                    onClick={() => onReview([candidate.id], "confirmed")}
                    aria-label="Confirmer"
                    className="text-green-600 hover:text-green-600"
                  >
                    <Check className="size-4" />
                  </Button>
                )}
                {candidate.status !== "rejected" && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isReviewing}
                    onClick={() => onReview([candidate.id], "rejected")}
                    aria-label="Refuser"
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
