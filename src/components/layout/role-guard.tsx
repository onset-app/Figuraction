"use client"

import { useCurrentUser } from "@/hooks/use-current-user"
import type { UserRole } from "@/types/enums"

/**
 * Client-side role gate for page content. Renders a 403 message when the
 * current user's role is not in `allow`.
 *
 * This is a UX guard only — it hides UI, it does not secure data. Real access
 * control lives in the RLS policies and the proxy middleware; server actions
 * must re-check ownership/role independently.
 */
export function RoleGuard({
  allow,
  children,
}: {
  allow: ReadonlyArray<UserRole>
  children: React.ReactNode
}) {
  const { role, isLoading } = useCurrentUser()

  if (isLoading) {
    return <div className="text-muted-foreground p-6 text-sm">Chargement…</div>
  }

  if (!role || !allow.includes(role)) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-12 text-center">
        <p className="text-3xl font-bold">403</p>
        <p className="text-muted-foreground">Vous n'avez pas accès à cette page.</p>
      </div>
    )
  }

  return <>{children}</>
}
