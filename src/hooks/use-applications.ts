"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { getMyApplications } from "@/actions/applications"
import { useCurrentUser } from "@/hooks/use-current-user"
import { createClient } from "@/lib/supabase/client"

// Figurant-side hooks: the current user's own applications. The production-
// side hooks (candidates, review) live in use-candidates.ts.

export const MY_APPLICATIONS_QUERY_KEY = ["my-applications"] as const

/** The current figurant's applications (with joined casting info), cached with TanStack Query. */
export function useMyApplications() {
  return useQuery({
    queryKey: MY_APPLICATIONS_QUERY_KEY,
    queryFn: getMyApplications,
  })
}

/**
 * Live status updates for the figurant's applications (CLAUDE.md MVP §5):
 * subscribes to Postgres changes on the caller's own application rows and
 * invalidates the list so a production's confirm/reject shows up without a
 * refresh. RLS scopes the stream to rows the subscriber can SELECT
 * (`applications_select_own_figurant`); the figurant_id filter narrows the
 * firehose server-side. Requires `applications` in the supabase_realtime
 * publication (007_rls_policies.sql).
 */
export function useMyApplicationsRealtime() {
  const queryClient = useQueryClient()
  const { user } = useCurrentUser()
  const userId = user?.id ?? null

  useEffect(() => {
    if (!userId) {
      return
    }
    const supabase = createClient()
    const channel = supabase
      .channel(`my-applications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "applications",
          filter: `figurant_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: MY_APPLICATIONS_QUERY_KEY })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, queryClient])
}
