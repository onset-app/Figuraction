"use client"

import { Loader2, Users } from "lucide-react"
import Link from "next/link"
import { RoleGuard } from "@/components/layout/role-guard"
import { EmptyState } from "@/components/shared/empty-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useFigurants } from "@/hooks/use-candidates"
import { EXPERIENCE_LABELS } from "@/schemas/profile"

function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

/**
 * Browse-all-figurants page for productions (CLAUDE.md: "Browse all
 * candidates"). Deliberately minimal for now — the full search & filters
 * experience is a Phase 2 item; each card links to the existing candidate
 * detail page (without an ?application context, so no review buttons there).
 */
function FigurantsList() {
  const { data: figurants, isLoading } = useFigurants()

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  if (!figurants || figurants.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Aucun figurant inscrit pour le moment."
        description="Les profils apparaîtront ici dès que des figurants se seront inscrits."
      />
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        {figurants.length} figurant{figurants.length !== 1 ? "s" : ""} inscrit
        {figurants.length !== 1 ? "s" : ""}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {figurants.map((figurant) => (
          <Link key={figurant.id} href={`/app/candidats/${figurant.id}`}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardContent className="flex items-center gap-3 py-4">
                <Avatar className="size-12 shrink-0">
                  {figurant.photoUrl && <AvatarImage src={figurant.photoUrl} alt="" />}
                  <AvatarFallback>{initials(figurant.firstName, figurant.lastName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate font-medium">
                    {figurant.firstName} {figurant.lastName}
                  </p>
                  <p className="text-muted-foreground truncate text-sm">
                    {[figurant.age != null ? `${figurant.age} ans` : null, figurant.city]
                      .filter(Boolean)
                      .join(" · ") || "Profil à compléter"}
                  </p>
                  {figurant.experience && (
                    <Badge variant="outline">{EXPERIENCE_LABELS[figurant.experience]}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function CandidatsPage() {
  return (
    <RoleGuard allow={["production", "admin"]}>
      <FigurantsList />
    </RoleGuard>
  )
}
