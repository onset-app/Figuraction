import {
  Car,
  Clapperboard,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  type LucideIcon,
  Shield,
  User,
  Users,
} from "lucide-react"
import type { UserRole } from "@/types/enums"

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  /** Roles allowed to see this entry. */
  roles: ReadonlyArray<UserRole>
}

/**
 * Single source of truth for the app navigation. The sidebar, the mobile drawer
 * and the bottom tab bar all derive their entries from this list, filtered by
 * the current user's role. Admins see every entry.
 */
export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  {
    href: "/app/dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    roles: ["figurant", "production", "admin"],
  },
  { href: "/app/castings", label: "Castings", icon: Clapperboard, roles: ["figurant", "admin"] },
  {
    href: "/app/candidatures",
    label: "Candidatures",
    icon: ClipboardList,
    roles: ["figurant", "admin"],
  },
  { href: "/app/covoiturage", label: "Covoiturage", icon: Car, roles: ["figurant", "admin"] },
  { href: "/app/projets", label: "Projets", icon: FolderKanban, roles: ["production", "admin"] },
  { href: "/app/candidats", label: "Candidats", icon: Users, roles: ["production", "admin"] },
  {
    href: "/app/profil",
    label: "Profil",
    icon: User,
    roles: ["figurant", "production", "admin"],
  },
  { href: "/app/admin", label: "Admin", icon: Shield, roles: ["admin"] },
]

/** Nav entries visible to the given role (empty when the role is unknown). */
export function navItemsForRole(role: UserRole | null): NavItem[] {
  if (!role) return []
  return NAV_ITEMS.filter((item) => item.roles.includes(role))
}

/** Whether a nav href is the active one for the current pathname. */
export function isNavItemActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Best-matching page title for a pathname (longest matching nav href wins). */
export function pageTitleForPath(pathname: string): string {
  const match = NAV_ITEMS.filter((item) => isNavItemActive(item.href, pathname)).sort(
    (a, b) => b.href.length - a.href.length
  )[0]
  return match?.label ?? "ONSET"
}
