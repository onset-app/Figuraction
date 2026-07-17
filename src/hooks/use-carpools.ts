"use client"

import { useQuery } from "@tanstack/react-query"
import { getCarpools, getOpenProjects } from "@/actions/carpools"

export const CARPOOLS_QUERY_KEY = ["carpools"] as const
export const OPEN_PROJECTS_QUERY_KEY = ["open-projects"] as const

/** Every carpool offer (with linked project titles), cached with TanStack Query. */
export function useCarpools() {
  return useQuery({
    queryKey: CARPOOLS_QUERY_KEY,
    queryFn: getCarpools,
  })
}

/** Open projects available to link a new carpool to. */
export function useOpenProjects() {
  return useQuery({
    queryKey: OPEN_PROJECTS_QUERY_KEY,
    queryFn: getOpenProjects,
  })
}
