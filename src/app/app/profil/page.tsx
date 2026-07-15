"use client"

import { useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { PhotoUpload } from "@/components/profil/photo-upload"
import { ProfileForm } from "@/components/profil/profile-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CURRENT_USER_QUERY_KEY, useCurrentUser } from "@/hooks/use-current-user"
import { EXPERIENCE_LABELS, isExperienceLevel } from "@/schemas/profile"

/** A labeled row in the read-only profile view. */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm">
      <span className="text-muted-foreground">{label} : </span>
      {value}
    </p>
  )
}

export default function ProfilPage() {
  const { profile, isLoading } = useCurrentUser()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  function invalidateProfile() {
    queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  // The proxy guarantees an authenticated session with a profile row for
  // every /app/* request, so this only guards against the initial render.
  if (!profile) {
    return null
  }

  return (
    <div className="max-w-xl space-y-6">
      <PhotoUpload
        photoUrl={profile.photoUrl}
        firstName={profile.firstName}
        lastName={profile.lastName}
        onUploaded={invalidateProfile}
      />

      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Modifier mon profil</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm
              defaultValues={{
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone ?? "",
                city: profile.city ?? "",
                age: profile.age ?? undefined,
                bio: profile.bio ?? "",
                experience: isExperienceLevel(profile.experience) ? profile.experience : undefined,
              }}
              onSuccess={() => {
                invalidateProfile()
                setIsEditing(false)
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {profile.firstName} {profile.lastName}
            </CardTitle>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Modifier
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <InfoRow label="Ville" value={profile.city || "—"} />
            <InfoRow label="Âge" value={profile.age ? String(profile.age) : "—"} />
            <InfoRow
              label="Expérience"
              value={
                isExperienceLevel(profile.experience) ? EXPERIENCE_LABELS[profile.experience] : "—"
              }
            />
            <InfoRow label="Bio" value={profile.bio || "—"} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
