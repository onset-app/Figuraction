"use client"

import { Clapperboard } from "lucide-react"
import { CastingCard } from "@/components/castings/casting-card"
import { CastingFilters } from "@/components/castings/casting-filters"
import { useCastings } from "@/hooks/use-castings"
import { useFiltersStore } from "@/stores/filters-store"

export default function CastingsPage() {
  const filters = useFiltersStore((state) => state.castingFilters)
  const { data: castings, isLoading } = useCastings(filters)

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Parcourez les castings ouverts et postulez en un clic.
      </p>

      <CastingFilters />

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Chargement…</p>
      ) : !castings || castings.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Clapperboard className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">Aucun casting ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {castings.map((casting) => (
            <CastingCard key={casting.id} casting={casting} href={`/app/castings/${casting.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}
