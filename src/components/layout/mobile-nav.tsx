"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCurrentUser } from "@/hooks/use-current-user"
import { cn } from "@/lib/utils"
import { isNavItemActive, navItemsForRole } from "./nav-config"

/**
 * Fixed bottom tab bar shown on mobile only. Displays the primary nav entries
 * for the current role (capped so they fit); the full list stays reachable
 * through the drawer in the topbar.
 */
export function MobileNav() {
  const pathname = usePathname()
  const { role } = useCurrentUser()
  const items = navItemsForRole(role).slice(0, 5)

  if (items.length === 0) return null

  return (
    <nav className="bg-background fixed inset-x-0 bottom-0 z-20 flex border-t md:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active = isNavItemActive(href, pathname)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-xs",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
            <span className="max-w-full truncate px-1">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
