"use client"

import { useQuery } from "@tanstack/react-query"
import { getMyProjects, getProject } from "@/actions/projects"

export const MY_PROJECTS_QUERY_KEY = ["my-projects"] as const

/** Query key for a single project by id. */
export const projectQueryKey = (id: string) => ["project", id] as const

/** The current production's own projects (any status), cached with TanStack Query. */
export function useProjects() {
  return useQuery({
    queryKey: MY_PROJECTS_QUERY_KEY,
    queryFn: getMyProjects,
  })
}

/** A single owned project by id (null when not found / not owned). */
export function useProject(id: string) {
  return useQuery({
    queryKey: projectQueryKey(id),
    queryFn: () => getProject(id),
  })
}
