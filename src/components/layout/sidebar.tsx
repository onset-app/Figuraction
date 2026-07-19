"use client"

import { useQueryClient } from "@tanstack/react-query"
import { LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/actions/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useCurrentUser } from "@/hooks/use-current-user"
import { cn } from "@/lib/utils"
import { useUiStore } from "@/stores/ui-store"
import { isNavItemActive, type NavItem, navItemsForRole } from "./nav-config"

/** Vertical list of nav links, shared by the desktop sidebar and mobile drawer. */
export function AppNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {items.map(({ href, label, icon: Icon }) => {
        const active = isNavItemActive(href, pathname)
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

/** Avatar, name, role and a logout button. Shown at the bottom of the nav. */
export function UserBlock() {
  const { profile, role } = useCurrentUser()
  const queryClient = useQueryClient()
  const initials =
    `${profile?.firstName?.[0] ?? ""}${profile?.lastName?.[0] ?? ""}`.toUpperCase() || "?"
  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : "…"

  return (
    <div className="mt-auto flex items-center gap-3 border-t p-3">
      <Avatar className="size-9 shrink-0">
        <AvatarImage src={profile?.photoUrl ?? undefined} alt={fullName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{fullName}</p>
        {role && <p className="text-muted-foreground truncate text-xs capitalize">{role}</p>}
      </div>
      {/* Native form action so logout()'s server-side redirect drives the
          navigation. Clearing the cache in onSubmit (before the action
          dispatches) drops the previous user's cached profile/lists, so a
          re-login can't show stale data — the browser's onAuthStateChange
          never fires for the server-side login/logout. */}
      <form action={logout} onSubmit={() => queryClient.clear()}>
        <Button type="submit" variant="ghost" size="icon" aria-label="Se déconnecter">
          <LogOut className="size-4" />
        </Button>
      </form>
    </div>
  )
}

/** Persistent desktop sidebar (hidden on mobile, collapsible via the ui-store). */
export function Sidebar() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen)
  const { role } = useCurrentUser()
  const items = navItemsForRole(role)

  return (
    <aside
      className={cn(
        "bg-card hidden w-64 shrink-0 flex-col border-r",
        sidebarOpen ? "md:flex" : "md:hidden"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/app/dashboard" className="text-lg font-bold tracking-tight">
          ONSET
        </Link>
      </div>
      <AppNav items={items} />
      <UserBlock />
    </aside>
  )
}
