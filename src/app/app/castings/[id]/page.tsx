import { notFound } from "next/navigation"
import { getMyApplication } from "@/actions/applications"
import { getCastingDetail } from "@/actions/castings"
import { ApplicationForm } from "@/components/castings/application-form"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatAgeRangeFr, formatDateRangeShortFr, formatDateShortFr } from "@/lib/utils"
import { ROLE_TYPE_LABELS } from "@/schemas/casting"

export default async function CastingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const casting = await getCastingDetail(id)
  if (!casting) {
    notFound()
  }

  const existingApplication = await getMyApplication(id)
  const ageRange = formatAgeRangeFr(casting.ageMin, casting.ageMax)
  const projectDates = formatDateRangeShortFr(
    casting.project.shootDateStart,
    casting.project.shootDateEnd
  )

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">{casting.project.title}</p>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{casting.title}</h1>
          {casting.roleType && (
            <Badge variant="secondary">{ROLE_TYPE_LABELS[casting.roleType]}</Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Détails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {casting.description && <p>{casting.description}</p>}
          <dl className="grid grid-cols-2 gap-2 text-muted-foreground">
            {casting.location && (
              <div>
                <dt className="font-medium text-foreground">Lieu</dt>
                <dd>{casting.location}</dd>
              </div>
            )}
            {casting.shootDate && (
              <div>
                <dt className="font-medium text-foreground">Date de tournage</dt>
                <dd>{formatDateShortFr(casting.shootDate)}</dd>
              </div>
            )}
            {ageRange && (
              <div>
                <dt className="font-medium text-foreground">Âge</dt>
                <dd>{ageRange}</dd>
              </div>
            )}
            <div>
              <dt className="font-medium text-foreground">Places</dt>
              <dd>
                {casting.spotsAvailable} place{casting.spotsAvailable !== 1 ? "s" : ""}
              </dd>
            </div>
          </dl>
          {(casting.project.shootLocation || projectDates) && (
            <div className="border-t pt-2 text-muted-foreground">
              <p className="font-medium text-foreground">Projet</p>
              {casting.project.shootLocation && <p>{casting.project.shootLocation}</p>}
              {projectDates && <p>{projectDates}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Postuler</CardTitle>
        </CardHeader>
        <CardContent>
          <ApplicationForm
            castingId={casting.id}
            existingStatus={existingApplication?.status ?? null}
          />
        </CardContent>
      </Card>
    </div>
  )
}
