"use client"

import { useQuery } from "@tanstack/react-query"
import { getApplicationReviewInfo } from "@/actions/applications"
import { getFigurantProfile } from "@/actions/profiles"

/** Query key for a figurant profile viewed by a production. */
export const figurantProfileQueryKey = (id: string) => ["figurant-profile", id] as const

/** A figurant's full profile for the candidate detail page. */
export function useFigurantProfile(id: string) {
  return useQuery({
    queryKey: figurantProfileQueryKey(id),
    queryFn: () => getFigurantProfile(id),
  })
}

/** Query key for a single application's reviewable context. */
export const applicationReviewQueryKey = (id: string) => ["application-review", id] as const

/**
 * The reviewable context (status + casting) of an application, enabled only
 * when an application id is present in the candidate page's query string.
 */
export function useApplicationReview(id: string | null) {
  return useQuery({
    queryKey: applicationReviewQueryKey(id ?? ""),
    queryFn: () => (id ? getApplicationReviewInfo(id) : null),
    enabled: id !== null,
  })
}
