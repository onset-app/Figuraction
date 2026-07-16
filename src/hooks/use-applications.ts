"use client"

import { useQuery } from "@tanstack/react-query"
import { getMyApplications } from "@/actions/applications"

export const MY_APPLICATIONS_QUERY_KEY = ["my-applications"] as const

/** The current figurant's applications (with joined casting info), cached with TanStack Query. */
export function useMyApplications() {
  return useQuery({
    queryKey: MY_APPLICATIONS_QUERY_KEY,
    queryFn: getMyApplications,
  })
}
