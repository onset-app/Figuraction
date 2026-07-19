"use client"

import { useQueryClient } from "@tanstack/react-query"
import { type FormEvent, useState } from "react"
import { toast } from "sonner"
import { createApplication } from "@/actions/applications"
import { APPLICATION_STATUS_LABELS } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MY_APPLICATIONS_QUERY_KEY } from "@/hooks/use-applications"
import { useCurrentUser } from "@/hooks/use-current-user"
import { EXPERIENCE_LABELS } from "@/schemas/profile"
import type { ApplicationStatus } from "@/types/enums"

export function ApplicationForm({
  castingId,
  existingStatus,
}: {
  castingId: string
  existingStatus: ApplicationStatus | null
}) {
  const { profile, role, isLoading } = useCurrentUser()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Locally tracked so the form flips to "applied" without a reload after submit.
  const [appliedStatus, setAppliedStatus] = useState<ApplicationStatus | null>(existingStatus)

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Chargement…</p>
  }

  // A withdrawn application can be resubmitted (createApplication revives it),
  // so it doesn't block the form — only an active application does.
  if (appliedStatus && appliedStatus !== "withdrawn") {
    return (
      <div className="rounded-lg border p-4 text-sm">
        <p className="font-medium">Vous avez déjà postulé à ce casting.</p>
        <p className="text-muted-foreground">Statut : {APPLICATION_STATUS_LABELS[appliedStatus]}</p>
      </div>
    )
  }

  if (role !== "figurant") {
    return (
      <p className="text-muted-foreground text-sm">
        Seuls les figurants peuvent postuler à un casting.
      </p>
    )
  }

  const hasWithdrawn = appliedStatus === "withdrawn"

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    const result = await createApplication({ castingId, message: message.trim() || undefined })
    setIsSubmitting(false)
    if (result.success) {
      // revalidatePath only refreshes the server cache; the Candidatures page
      // reads the client query cache, so invalidate it here — otherwise a
      // reapply (withdrawn → pending) shows a stale badge until a refresh.
      queryClient.invalidateQueries({ queryKey: MY_APPLICATIONS_QUERY_KEY })
      toast.success("Candidature envoyée !")
      setAppliedStatus("pending")
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {hasWithdrawn && (
        <p className="rounded-lg border border-dashed p-3 text-muted-foreground text-sm">
          Vous aviez retiré votre candidature. Vous pouvez postuler à nouveau.
        </p>
      )}

      <div className="space-y-1 rounded-lg border p-4 text-sm">
        <p className="font-medium">Votre profil</p>
        {profile ? (
          <>
            <p className="text-muted-foreground">
              {profile.firstName} {profile.lastName}
              {profile.age != null ? `, ${profile.age} ans` : ""}
            </p>
            {profile.city && <p className="text-muted-foreground">{profile.city}</p>}
            {profile.experience && (
              <p className="text-muted-foreground">{EXPERIENCE_LABELS[profile.experience]}</p>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">Complétez votre profil avant de postuler.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message (optionnel)</Label>
        <Textarea
          id="message"
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Présentez-vous en quelques mots à la production…"
          maxLength={2000}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Envoi…" : "Envoyer ma candidature"}
      </Button>
    </form>
  )
}
