import Link from "next/link"
import { SiteNavMobile } from "@/components/layout/site-nav-mobile"
import { buttonVariants } from "@/components/ui/button"

const NAV_LINKS = [
  { href: "/castings", label: "Castings" },
  { href: "/devenir-figurant", label: "Devenir figurant" },
  { href: "/pour-les-productions", label: "Pour les productions" },
] as const

/** Public site header shared by the landing and all (public) pages. */
export function SiteHeader() {
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          ONSET
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
            Connexion
          </Link>
          <Link href="/signup" className={buttonVariants()}>
            Créer un compte
          </Link>
          <SiteNavMobile links={NAV_LINKS} />
        </div>
      </div>
    </header>
  )
}
