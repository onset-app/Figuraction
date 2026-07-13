import { create } from "zustand"
import type { RoleType } from "@/types/enums"

/**
 * Filters applied to the casting catalogue (ticket #35) and, later, the
 * candidate browser. Kept in a client store so filter UI and result lists can
 * stay in sync without prop drilling.
 */
export interface CastingFilters {
  location: string | null
  roleType: RoleType | null
  ageMin: number | null
  ageMax: number | null
  date: string | null
}

const emptyFilters: CastingFilters = {
  location: null,
  roleType: null,
  ageMin: null,
  ageMax: null,
  date: null,
}

interface FiltersState {
  castingFilters: CastingFilters
  setCastingFilter: <K extends keyof CastingFilters>(key: K, value: CastingFilters[K]) => void
  resetCastingFilters: () => void
}

export const useFiltersStore = create<FiltersState>((set) => ({
  castingFilters: emptyFilters,
  setCastingFilter: (key, value) =>
    set((state) => ({
      castingFilters: { ...state.castingFilters, [key]: value },
    })),
  resetCastingFilters: () => set({ castingFilters: emptyFilters }),
}))
