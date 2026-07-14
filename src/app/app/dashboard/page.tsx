"use client"

import {
  Car,
  Clapperboard,
  ClipboardList,
  FolderKanban,
  type LucideIcon,
  Shield,
  User,
  Users,
} from "lucide-react"
import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrentUser } from "@/hooks/use-current-user"
import type { UserRole } from "@/types/enums"

type Shortcut = {
  href: string
  title: string
  description: string
  icon: LucideIcon
}

const SHORTCUTS: Record<UserRole, Shortcut[]> = {
  figurant: [
    {
      href: "/app/castings",
      title: "Castings",
      description: "Parcourez les castings ouverts et postulez.",
      icon: Clapperboard,
    },
    {
      href: "/app/candidatures",
      title: "Mes candidatures",
      description: "Suivez le statut de vos candidatures.",
      icon: ClipboardList,
    },
    {
      href: "/app/covoiturage",
      title: "Covoiturage",
      description: "Trouvez ou proposez un trajet vers un tournage.",
      icon: Car,
    },
    {
      href: "/app/profil",
      title: "Mon profil",
      description: "Complétez votre profil pour être repéré.",
      icon: User,
    },
  ],
  production: [
    {
      href: "/app/projets",
      title: "Mes projets",
      description: "Créez et gérez vos projets et castings.",
      icon: FolderKanban,
    },
    {
      href: "/app/candidats",
      title: "Candidats",
      description: "Parcourez les figurants et sélectionnez-les.",
      icon: Users,
    },
    {
      href: "/app/profil",
      title: "Mon profil",
      description: "Gérez les informations de votre production.",
      icon: User,
    },
  ],
  admin: [
    {
      href: "/app/admin",
      title: "Back-office",
      description: "Métriques et administration de la plateforme.",
      icon: Shield,
    },
    {
      href: "/app/projets",
      title: "Projets",
      description: "Supervisez tous les projets.",
      icon: FolderKanban,
    },
    {
      href: "/app/castings",
      title: "Castings",
      description: "Supervisez tous les castings.",
      icon: Clapperboard,
    },
    {
      href: "/app/candidats",
      title: "Utilisateurs",
      description: "Gérez les figurants et productions.",
      icon: Users,
    },
  ],
}

export default function DashboardPage() {
  const { profile, role, isLoading } = useCurrentUser()

  const greeting = profile ? `Bienvenue ${profile.firstName}` : "Bienvenue"
  const shortcuts = role ? SHORTCUTS[role] : []

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{greeting}</h2>
        <p className="text-muted-foreground">Que souhaitez-vous faire aujourd'hui ?</p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Chargement…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map(({ href, title, description, icon: Icon }) => (
            <Link key={href} href={href} className="group">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardHeader>
                  <div className="bg-muted text-foreground mb-2 flex size-10 items-center justify-center rounded-md">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
