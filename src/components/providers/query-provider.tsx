"use client"

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useEffect, useState } from "react"
import { CURRENT_USER_QUERY_KEY } from "@/hooks/use-current-user"
import { createClient } from "@/lib/supabase/client"

/**
 * Single app-wide Supabase auth listener: invalidates the current-user query
 * on every sign-in/sign-out. Mounted once here rather than inside
 * useCurrentUser, which would register one listener per consuming component.
 */
function AuthInvalidationListener() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY })
    })
    return () => subscription.unsubscribe()
  }, [queryClient])

  return null
}

/**
 * Provides a single TanStack Query client to the React tree.
 *
 * The client is created lazily in state so each browser session gets one stable
 * instance, and (in SSR) each request gets its own client rather than sharing a
 * module-level singleton across requests.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInvalidationListener />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
