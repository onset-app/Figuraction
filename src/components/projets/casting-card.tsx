"use client"

import { useState } from "react"
import { toast } from "sonner"
import type { CastingRow } from "@/actions/castings"
import { closeCasting } from "@/actions/castings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROLE_TYPE_LABELS } from "@/schemas/casting"
import type { CastingStatus, RoleType } from "@/types/enums"

/** Format a `YYYY-MM-DD` string as `DD/MM/YYYY` without Date/timezone conversion. */
function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-")
  return `${day}/${month}/${year}`
}

export function CastingCard({
  casting,
  onChanged,
}: {
  casting: CastingRow
  onChanged: () => void
}) {
  const [isClosing, setIsClosing] = useState(false)
  const status = casting.status as CastingStatus
  const isOpen = status === "open"

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
          {casting.roleType && <p>{ROLE_TYPE_LABELS[casting.roleType as RoleType]}</p>}
          <p>
            {casting.spotsAvailable} place{casting.spotsAvailable !== 1 ? "s" : ""}
          </p>
          {ageRange && <p>{ageRange}</p>}
          {casting.location && <p>{casting.location}</p>}
          {casting.shootDate && <p>{formatDate(casting.shootDate)}</p>}
        </div>
        {isOpen && (
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isClosing}>
            {isClosing ? "Fermeture…" : "Fermer le casting"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
