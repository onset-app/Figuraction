"use client"

import { useState } from "react"
import { toast } from "sonner"
import type { CastingRow } from "@/actions/castings"
import { closeCasting } from "@/actions/castings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateShortFr } from "@/lib/utils"
import { ROLE_TYPE_LABELS } from "@/schemas/casting"

export function CastingCard({
  casting,
  onChanged,
  onEdit,
}: {
  casting: CastingRow
  onChanged: () => void
  /** Opens the edit dialog owned by the parent page. */
  onEdit: () => void
}) {
  const [isClosing, setIsClosing] = useState(false)
  const isOpen = casting.status === "open"

  const ageRange =
    casting.ageMin != null && casting.ageMax != null
      ? `${casting.ageMin}–${casting.ageMax} ans`
      : casting.ageMin != null
        ? `${casting.ageMin}+ ans`
        : casting.ageMax != null
          ? `≤ ${casting.ageMax} ans`
          : null

  async function handleClose() {
    setIsClosing(true)
    const result = await closeCasting(casting.id)
    setIsClosing(false)
    if (result.success) {
      toast.success("Casting fermé.")
      onChanged()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <CardTitle className="text-base">{casting.title}</CardTitle>
        <Badge variant={isOpen ? "default" : "secondary"}>{isOpen ? "Ouvert" : "Fermé"}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1 text-muted-foreground text-sm">
          {casting.roleType && <p>{ROLE_TYPE_LABELS[casting.roleType]}</p>}
          <p>
            {casting.spotsAvailable} place{casting.spotsAvailable !== 1 ? "s" : ""}
          </p>
          {ageRange && <p>{ageRange}</p>}
          {casting.location && <p>{casting.location}</p>}
          {casting.shootDate && <p>{formatDateShortFr(casting.shootDate)}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            Modifier
          </Button>
          {isOpen && (
            <Button variant="outline" size="sm" onClick={handleClose} disabled={isClosing}>
              {isClosing ? "Fermeture…" : "Fermer le casting"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
