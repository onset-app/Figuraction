"use client"

import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Check, Loader2, Mail, X } from "lucide-react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { confirmApplication, rejectApplication } from "@/actions/applications"
import { RoleGuard } from "@/components/layout/role-guard"
import { StatusBadge } from "@/components/shared/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  applicationReviewQueryKey,
  useApplicationReview,
  useFigurantProfile,
} from "@/hooks/use-candidates"
import { EXPERIENCE_LABELS, isExperienceLevel } from "@/schemas/profile"

function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

/** A labeled row in the profile detail. */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm">
      <span className="text-muted-foreground">{label} : </span>
      {value}
    </p>
  )
}

function CandidateDetail({ figurantId }: { figurantId: string }) {
  const searchParams = useSearchParams()
  const applicationId = searchParams.get("application")
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useFigurantProfile(figurantId)
  const { data: reviewInfo } = useApplicationReview(applicationId)
  const [isReviewing, setIsReviewing] = useState(false)

  // Only trust the review context if the application actually belongs to the
  // figurant whose profile is shown (guards a hand-crafted, mismatched URL).
  const application = reviewInfo?.figurantId === figurantId ? reviewInfo : null

  async function handleReview(action: "confirmed" | "rejected") {
    if (!applicationId) return
    setIsReviewing(true)
    const result =
      action === "confirmed"
        ? await confirmApplication(applicationId)
        : await rejectApplication(applicationId)
    setIsReviewing(false)
    if (result.success && result.updated > 0) {
      toast.success(action === "confirmed" ? "Candidature confirmée." : "Candidature refusée.")
      queryClient.invalidateQueries({ queryKey: applicationReviewQueryKey(applicationId) })
    } else {
      toast.error(result.success ? "Candidature introuvable." : result.error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <Link
          href="/app/projets"
          className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Retour
        </Link>
        <p className="text-muted-foreground">Candidat introuvable.</p>
      </div>
    )
  }

  const details = [
    profile.age != null ? { label: "Âge", value: `${profile.age} ans` } : null,
    profile.city ? { label: "Ville", value: profile.city } : null,
    profile.phone ? { label: "Téléphone", value: profile.phone } : null,
    isExperienceLevel(profile.experience)
      ? { label: "Expérience", value: EXPERIENCE_LABELS[profile.experience] }
      : null,
  ].filter((row): row is { label: string; value: string } => row !== null)

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/app/projets"
        className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Retour
      </Link>

      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <Avatar size="lg" className="size-24">
          {profile.photoUrl && <AvatarImage src={profile.photoUrl} alt="" />}
          <AvatarFallback className="text-2xl">
            {initials(profile.firstName, profile.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h1 className="font-bold text-2xl">
            {profile.firstName} {profile.lastName}
          </h1>
          {application && (
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <span className="text-muted-foreground text-sm">{application.castingTitle}</span>
              <StatusBadge status={application.status} />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href={`mailto:${profile.email}`}>
          <Button variant="outline" size="sm">
            <Mail className="size-4" /> Contacter
          </Button>
        </a>
        {application && (
          <>
            <Button
              size="sm"
              variant="outline"
              disabled={isReviewing || application.status === "confirmed"}
              onClick={() => handleReview("confirmed")}
              className="text-green-600 hover:text-green-600"
            >
              <Check className="size-4" /> Confirmer
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isReviewing || application.status === "rejected"}
              onClick={() => handleReview("rejected")}
              className="text-destructive hover:text-destructive"
            >
              <X className="size-4" /> Refuser
            </Button>
          </>
        )}
      </div>

      {details.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {details.map((row) => (
              <InfoRow key={row.label} label={row.label} value={row.value} />
            ))}
          </CardContent>
        </Card>
      )}

      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{profile.bio}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function CandidatDetailPage() {
  const params = useParams<{ id: string }>()

  return (
    <RoleGuard allow={["production", "admin"]}>
      <CandidateDetail figurantId={params.id} />
    </RoleGuard>
  )
}
