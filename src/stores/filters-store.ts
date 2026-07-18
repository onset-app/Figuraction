import { create } from "zustand"
import type { RoleType } from "@/types/enums"

/**
 * Filters applied to the casting catalogue (ticket #35) and, later, the
 * candidate browser. Kept in a client store so filter UI and result lists can
 * stay in sync without prop drilling.
 *
 * Named CastingFilterState (nullable fields, store-side) to avoid colliding
 * with the action's CastingFilters input type (optional fields) and the
 * CastingFilters component.
 */
export interface CastingFilterState {
  location: string | null
  roleType: RoleType | null
  /**
   * The figurant's own age. Feeds `getPublicCastings`' age filter, which keeps
   * castings whose [ageMin, ageMax] range accepts this age (a single value, not
   * a range — a range would be meaningless against the castings' own ranges).
   */
  age: number | null
  date: string | null
}

const emptyFilters: CastingFilterState = {
  location: null,
  roleType: null,
  age: null,
  date: null,
}

interface FiltersState {
  castingFilters: CastingFilterState
  setCastingFilter: <K extends keyof CastingFilterState>(
    key: K,
    value: CastingFilterState[K]
  ) => void
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
