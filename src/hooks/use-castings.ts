"use client"

import { useQuery } from "@tanstack/react-query"
import { getCastingsByProject } from "@/actions/castings"

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
