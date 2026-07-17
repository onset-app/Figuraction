"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  bulkUpdateApplications,
  getMyApplications,
  type ReviewStatus,
} from "@/actions/applications"
import { getProjectCandidates, type ProjectCandidate } from "@/actions/projects"

export const MY_APPLICATIONS_QUERY_KEY = ["my-applications"] as const

/** The current figurant's applications (with joined casting info), cached with TanStack Query. */
export function useMyApplications() {
  return useQuery({
    queryKey: MY_APPLICATIONS_QUERY_KEY,
    queryFn: getMyApplications,
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
