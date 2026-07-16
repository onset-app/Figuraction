import Link from "next/link"
import type { CastingRow } from "@/actions/castings"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROLE_TYPE_LABELS } from "@/schemas/casting"
import type { RoleType } from "@/types/enums"

/** Format a `YYYY-MM-DD` string as `DD/MM/YYYY` without going through Date/timezone conversion. */
function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-")
  return `${day}/${month}/${year}`
}

function formatAgeRange(ageMin: number | null, ageMax: number | null): string | null {
  if (ageMin != null && ageMax != null) return `${ageMin}–${ageMax} ans`
  if (ageMin != null) return `${ageMin}+ ans`
  if (ageMax != null) return `≤ ${ageMax} ans`
  return null
}

/**
 * Public casting card, shared by the SEO catalogue and the authenticated
 * browsing page. `href` is caller-supplied since the destination depends on
 * auth state: `/login` when logged out, `/app/castings/[id]` when logged in.
 */
export function CastingCard({ casting, href }: { casting: CastingRow; href: string }) {
  const ageRange = formatAgeRange(casting.ageMin, casting.ageMax)

  return (
    <Link href={href}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <CardTitle className="text-base">{casting.title}</CardTitle>
          {casting.roleType && (
            <Badge variant="secondary">{ROLE_TYPE_LABELS[casting.roleType as RoleType]}</Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-1 text-muted-foreground text-sm">
          {casting.location && <p>{casting.location}</p>}
          {casting.shootDate && <p>{formatDate(casting.shootDate)}</p>}
          {ageRange && <p>{ageRange}</p>}
          <p>
            {casting.spotsAvailable} place{casting.spotsAvailable !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
