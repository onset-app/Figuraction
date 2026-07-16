"use client"

import Link from "next/link"
import type { ProjectCandidate } from "@/actions/projects"
import { StatusBadge } from "@/components/shared/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"

function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

/**
 * Candidates for a single casting, with per-row and select-all checkboxes.
 * Selection is owned by the parent page (keyed by application id) so a future
 * bulk confirm/reject bar can act across castings.
 */
export function CandidateList({
  castingTitle,
  candidates,
  selectedIds,
  onToggle,
  onToggleGroup,
}: {
  castingTitle: string
  candidates: ProjectCandidate[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onToggleGroup: (ids: string[], select: boolean) => void
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
                  href={`/app/candidats/${figurant.id}`}
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
            </li>
          )
        })}
      </ul>
    </section>
  )
}
