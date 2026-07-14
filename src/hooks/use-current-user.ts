"use client"

import type { User } from "@supabase/supabase-js"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/types/database"
import type { UserRole } from "@/types/enums"

export const CURRENT_USER_QUERY_KEY = ["current-user"] as const

/**
 * The subset of the profile exposed to the client. supabase-js returns raw
 * (snake_case) column names, so the select below aliases them back to the
 * camelCase Drizzle field names. Timestamps are omitted (not needed for
 * identity and would come back as strings rather than Date).
 */
export type CurrentUserProfile = Omit<Profile, "role" | "createdAt" | "updatedAt"> & {
  role: UserRole
}

type CurrentUser = {
  user: User | null
  profile: CurrentUserProfile | null
}

async function fetchCurrentUser(): Promise<CurrentUser> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { user: null, profile: null }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, email, role, firstName:first_name, lastName:last_name, phone, city, age, bio, experience, photoUrl:photo_url, available"
    )
    .eq("id", user.id)
    .single<CurrentUserProfile>()

  return { user, profile: profile ?? null }
}

/**
 * Current authenticated user and their profile, cached with TanStack Query.
 *
 * Re-fetches automatically on sign-in / sign-out so the identity stays in sync
 * with the Supabase session across the app.
 */
export function useCurrentUser() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // identity rarely changes within a session
  })

  useEffect(() => {
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY })
    })
    return () => subscription.unsubscribe()
  }, [queryClient])

  const user = query.data?.user ?? null
  const profile = query.data?.profile ?? null

  return {
    user,
    profile,
    role: profile?.role ?? null,
    isLoading: query.isLoading,
    isAuthenticated: user !== null,
  }
}
