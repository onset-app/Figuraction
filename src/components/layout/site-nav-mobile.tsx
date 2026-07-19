"use client"

import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"

/**
 * Mobile disclosure menu for the public site header (the inline nav is hidden
 * below `md`). A client component so the menu closes on link click — Next
 * navigates client-side, so a CSS-only solution would stay open.
 */
export function SiteNavMobile({
  links,
}: {
  links: ReadonlyArray<{ href: string; label: string }>
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>
      {open && (
        <nav className="bg-background absolute top-full right-0 z-50 mt-2 w-56 rounded-lg border p-2 shadow-lg">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:bg-muted hover:text-foreground block rounded-md px-3 py-2 text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
