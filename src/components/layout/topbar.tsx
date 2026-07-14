"use client"

import { Menu, PanelLeft } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useUiStore } from "@/stores/ui-store"
import { navItemsForRole, pageTitleForPath } from "./nav-config"
import { AppNav, UserBlock } from "./sidebar"

export function Topbar() {
  const pathname = usePathname()
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen)
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen)
  const { role } = useCurrentUser()
  const title = pageTitleForPath(pathname)

  return (
    <header className="bg-background sticky top-0 z-10 flex h-14 items-center gap-2 border-b px-4">
      {/* Mobile: open the full navigation drawer. */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Ouvrir le menu"
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu className="size-5" />
      </Button>
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="flex w-72 flex-col p-0">
          <SheetHeader className="h-14 justify-center border-b px-4">
            <SheetTitle className="text-left">ONSET</SheetTitle>
          </SheetHeader>
          <AppNav items={navItemsForRole(role)} onNavigate={() => setMobileNavOpen(false)} />
          <UserBlock />
        </SheetContent>
      </Sheet>

      {/* Desktop: collapse / expand the sidebar. */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:inline-flex"
        onClick={toggleSidebar}
        aria-label="Basculer le menu latéral"
      >
        <PanelLeft className="size-5" />
      </Button>

      <h1 className="truncate text-base font-semibold">{title}</h1>

      <Link href="/app/dashboard" className="ml-auto text-sm font-bold tracking-tight md:hidden">
        ONSET
      </Link>
    </header>
  )
}
