"use client"

import { useQuery } from "@tanstack/react-query"
import { getMyProjects } from "@/actions/projects"

export const MY_PROJECTS_QUERY_KEY = ["my-projects"] as const

/** The current production's own projects (any status), cached with TanStack Query. */
export function useProjects() {
  return useQuery({
    queryKey: MY_PROJECTS_QUERY_KEY,
    queryFn: getMyProjects,
  })
}
