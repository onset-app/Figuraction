"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ROLE_TYPE_LABELS, roleTypes } from "@/schemas/casting"
import { useFiltersStore } from "@/stores/filters-store"
import type { RoleType } from "@/types/enums"

/** Sentinel for the "all role types" option (Base UI Select needs a string value). */
const ALL_ROLES = "all"

export function CastingFilters() {
  const filters = useFiltersStore((state) => state.castingFilters)
  const setFilter = useFiltersStore((state) => state.setCastingFilter)
  const resetFilters = useFiltersStore((state) => state.resetCastingFilters)

  const hasActiveFilter =
    filters.location != null ||
    filters.roleType != null ||
    filters.age != null ||
    filters.date != null

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="filter-location">Lieu</Label>
          <Input
            id="filter-location"
            placeholder="Ex : Bruxelles"
            value={filters.location ?? ""}
            onChange={(event) => setFilter("location", event.target.value.trim() || null)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-role-type">Type de rôle</Label>
          <Select
            value={filters.roleType ?? ALL_ROLES}
            onValueChange={(value) =>
              setFilter("roleType", value === ALL_ROLES ? null : (value as RoleType))
            }
          >
            <SelectTrigger id="filter-role-type" className="w-full">
              <SelectValue>
                {(value: string | null) =>
                  value && value !== ALL_ROLES ? ROLE_TYPE_LABELS[value as RoleType] : "Tous"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ROLES}>Tous</SelectItem>
              {roleTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {ROLE_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-age">Âge</Label>
          <Input
            id="filter-age"
            type="number"
            min={0}
            max={120}
            placeholder="Mon âge"
            value={filters.age ?? ""}
            onChange={(event) => {
              const parsed = Number(event.target.value)
              setFilter("age", event.target.value !== "" && Number.isFinite(parsed) ? parsed : null)
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-date">Date de tournage</Label>
          <Input
            id="filter-date"
            type="date"
            value={filters.date ?? ""}
            onChange={(event) => setFilter("date", event.target.value || null)}
          />
        </div>
      </div>

      {hasActiveFilter && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          Réinitialiser les filtres
        </Button>
      )}
    </div>
  )
}
