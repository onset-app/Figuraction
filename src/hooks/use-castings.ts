"use client"

import { useQuery } from "@tanstack/react-query"
import { getCastingsByProject, getPublicCastings } from "@/actions/castings"
import type { CastingFilterState } from "@/stores/filters-store"

/** Query key for the castings belonging to a given project. */
export const projectCastingsQueryKey = (projectId: string) =>
  ["project-castings", projectId] as const

/** Castings under a project (owner-scoped by RLS), cached with TanStack Query. */
export function useProjectCastings(projectId: string) {
  return useQuery({
    queryKey: projectCastingsQueryKey(projectId),
    queryFn: () => getCastingsByProject(projectId),
  })
}

export const CASTINGS_QUERY_KEY = "public-castings"

/**
 * Open castings for the authenticated catalogue, filtered client-side via the
 * Zustand filters store. The store's nullable fields are mapped to the action's
 * optional ones (null → omitted). Filters are part of the query key, so the
 * list refetches whenever they change; TanStack caches each filter combination.
 */
export function useCastings(filters: CastingFilterState) {
  return useQuery({
    queryKey: [CASTINGS_QUERY_KEY, filters] as const,
    queryFn: () =>
      getPublicCastings({
        location: filters.location?.trim() || undefined,
        roleType: filters.roleType ?? undefined,
        age: filters.age ?? undefined,
        date: filters.date ?? undefined,
      }),
  })
}
