"use client"

import { useQueryClient } from "@tanstack/react-query"
import { ClipboardList } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import type { MyApplication } from "@/actions/applications"
import { withdrawApplication } from "@/actions/applications"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MY_APPLICATIONS_QUERY_KEY, useMyApplications } from "@/hooks/use-applications"

/** Format a `YYYY-MM-DD` string as `DD/MM/YYYY` without Date/timezone conversion. */
function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-")
  return `${day}/${month}/${year}`
}

function ApplicationRow({ application }: { application: MyApplication }) {
  const queryClient = useQueryClient()
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const { casting, status } = application

  async function handleWithdraw() {
    setIsWithdrawing(true)
    const result = await withdrawApplication(application.id)
    setIsWithdrawing(false)
    if (result.success) {
      toast.success("Candidature retirée.")
      queryClient.invalidateQueries({ queryKey: MY_APPLICATIONS_QUERY_KEY })
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="space-y-1">
          {casting ? (
            casting.status === "open" ? (
              <Link href={`/app/castings/${casting.id}`} className="font-medium hover:underline">
                {casting.title}
              </Link>
            ) : (
              <p className="font-medium">{casting.title}</p>
            )
          ) : (
            <p className="font-medium text-muted-foreground">Casting supprimé</p>
          )}
          <div className="flex flex-wrap gap-x-3 text-muted-foreground text-sm">
            {casting?.location && <span>{casting.location}</span>}
            {casting?.shootDate && <span>{formatDate(casting.shootDate)}</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          {status === "pending" && (
            <Button variant="outline" size="sm" onClick={handleWithdraw} disabled={isWithdrawing}>
              {isWithdrawing ? "Retrait…" : "Retirer"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function CandidaturesPage() {
  const { data: applications, isLoading } = useMyApplications()

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Suivez l'état de vos candidatures aux castings.
      </p>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Chargement…</p>
      ) : !applications || applications.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Aucune candidature pour le moment."
          description="Parcourez les castings ouverts et postulez en un clic."
          action={
            <Link href="/app/castings" className={buttonVariants({ variant: "outline" })}>
              Voir les castings
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {applications.map((application) => (
            <ApplicationRow key={application.id} application={application} />
          ))}
        </div>
      )}
    </div>
  )
}
