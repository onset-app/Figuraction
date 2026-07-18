"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  bulkUpdateApplications,
  getApplicationReviewInfo,
  type ReviewStatus,
} from "@/actions/applications"
import { getFigurantProfile, getFigurants } from "@/actions/profiles"
import { getProjectCandidates, type ProjectCandidate } from "@/actions/projects"

// Production-side hooks: browsing figurants and reviewing their applications.
// The figurant-side hooks (own applications) live in use-applications.ts.

export const FIGURANTS_QUERY_KEY = ["figurants"] as const

/** Every figurant profile, for the browse-all-candidates page. */
export function useFigurants() {
  return useQuery({
    queryKey: FIGURANTS_QUERY_KEY,
    queryFn: getFigurants,
  })
}

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

/** Query key for the candidates (applications + profiles) under a given project. */
export const projectCandidatesQueryKey = (projectId: string) =>
  ["project-candidates", projectId] as const

/** Candidates to a production's project, grouped/consumed by the review view. */
export function useProjectCandidates(projectId: string) {
  return useQuery({
    queryKey: projectCandidatesQueryKey(projectId),
    queryFn: () => getProjectCandidates(projectId),
  })
}

/**
 * Confirm/reject applications with an optimistic status flip on the project's
 * candidate list, rolled back on failure and reconciled on settle.
 */
export function useReviewApplications(projectId: string) {
  const queryClient = useQueryClient()
  const queryKey = projectCandidatesQueryKey(projectId)

  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: ReviewStatus }) => {
      const result = await bulkUpdateApplications(ids, status)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result
    },
    onMutate: async ({ ids, status }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<ProjectCandidate[]>(queryKey)
      const target = new Set(ids)
      queryClient.setQueryData<ProjectCandidate[]>(queryKey, (old) =>
        old?.map((candidate) => (target.has(candidate.id) ? { ...candidate, status } : candidate))
      )
      return { previous }
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue. Réessayez.")
    },
    onSuccess: ({ updated }, { status }) => {
      const verb = status === "confirmed" ? "confirmée" : "refusée"
      toast.success(updated <= 1 ? `Candidature ${verb}.` : `${updated} candidatures ${verb}s.`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })
}
