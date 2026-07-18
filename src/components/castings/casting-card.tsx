import Link from "next/link"
import type { CastingRow } from "@/actions/castings"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatAgeRangeFr, formatDateShortFr } from "@/lib/utils"
import { ROLE_TYPE_LABELS } from "@/schemas/casting"

/**
 * Public casting card, shared by the SEO catalogue and the authenticated
 * browsing page. `href` is caller-supplied since the destination depends on
 * auth state: `/login` when logged out, `/app/castings/[id]` when logged in.
 */
export function CastingCard({ casting, href }: { casting: CastingRow; href: string }) {
  const ageRange = formatAgeRangeFr(casting.ageMin, casting.ageMax)

  return (
    <Link href={href}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <CardTitle className="text-base">{casting.title}</CardTitle>
          {casting.roleType && (
            <Badge variant="secondary">{ROLE_TYPE_LABELS[casting.roleType]}</Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-1 text-muted-foreground text-sm">
          {casting.location && <p>{casting.location}</p>}
          {casting.shootDate && <p>{formatDateShortFr(casting.shootDate)}</p>}
          {ageRange && <p>{ageRange}</p>}
          <p>
            {casting.spotsAvailable} place{casting.spotsAvailable !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
