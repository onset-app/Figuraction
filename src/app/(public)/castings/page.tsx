import type { Metadata } from "next"
import { getPublicCastings } from "@/actions/castings"
import { CastingCard } from "@/components/castings/casting-card"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Castings figurants en Belgique | ONSET",
  description:
    "Découvrez les castings de figurants ouverts en Belgique : tournages, lieux, dates et places disponibles. Postulez en quelques clics sur ONSET.",
  openGraph: {
    title: "Castings figurants en Belgique | ONSET",
    description:
      "Découvrez les castings de figurants ouverts en Belgique : tournages, lieux, dates et places disponibles.",
    type: "website",
  },
}

export default async function PublicCastingsPage() {
  const supabase = await createClient()
  const [{ data: userData }, castings] = await Promise.all([
    supabase.auth.getUser(),
    getPublicCastings(),
  ])
  const isAuthenticated = Boolean(userData.user)

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-2xl space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Castings figurants en Belgique
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Parcourez les castings actuellement ouverts et postulez directement en ligne.
        </p>
      </div>

      {castings.length === 0 ? (
        <p className="text-muted-foreground mt-12 text-sm">
          Aucun casting ouvert pour le moment. Revenez bientôt&nbsp;!
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {castings.map((casting) => (
            <CastingCard
              key={casting.id}
              casting={casting}
              href={isAuthenticated ? `/app/castings/${casting.id}` : "/login"}
            />
          ))}
        </div>
      )}
    </main>
  )
}
