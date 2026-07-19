"use client"

import { useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { deleteCarpool, setCarpoolFull } from "@/actions/carpools"
import { CarpoolForm } from "@/components/covoiturage/carpool-form"
import { CarpoolList } from "@/components/covoiturage/carpool-list"
import { RoleGuard } from "@/components/layout/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CARPOOLS_QUERY_KEY, useCarpools, useOpenProjects } from "@/hooks/use-carpools"
import { useCurrentUser } from "@/hooks/use-current-user"

function Covoiturage() {
  const queryClient = useQueryClient()
  const { user, profile } = useCurrentUser()
  const { data: carpools, isLoading } = useCarpools()
  const { data: projects } = useOpenProjects()
  const [pendingId, setPendingId] = useState<string | null>(null)

  function invalidateCarpools() {
    queryClient.invalidateQueries({ queryKey: CARPOOLS_QUERY_KEY })
  }

  async function handleSetFull(id: string, isFull: boolean) {
    setPendingId(id)
    const result = await setCarpoolFull(id, isFull)
    setPendingId(null)
    if (result.success) {
      toast.success(isFull ? "Trajet marqué complet." : "Trajet rouvert.")
      invalidateCarpools()
    } else {
      toast.error(result.error)
    }
  }

  async function handleDelete(id: string) {
    setPendingId(id)
    const result = await deleteCarpool(id)
    setPendingId(null)
    if (result.success) {
      toast.success("Trajet supprimé.")
      invalidateCarpools()
    } else {
      toast.error(result.error)
    }
  }

  const defaultDriverName = profile ? `${profile.firstName} ${profile.lastName}` : ""

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Proposer un trajet</CardTitle>
        </CardHeader>
        <CardContent>
          <CarpoolForm
            projects={projects ?? []}
            defaultDriverName={defaultDriverName}
            onSuccess={invalidateCarpools}
          />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-20 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : (
        <CarpoolList
          carpools={carpools ?? []}
          currentUserId={user?.id ?? null}
          onSetFull={handleSetFull}
          onDelete={handleDelete}
          pendingId={pendingId}
        />
      )}
    </div>
  )
}

export default function CovoituragePage() {
  return (
    <RoleGuard allow={["figurant", "admin"]}>
      <Covoiturage />
    </RoleGuard>
  )
}
