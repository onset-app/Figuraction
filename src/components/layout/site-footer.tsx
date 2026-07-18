import Link from "next/link"

const FOOTER_COLUMNS = [
  {
    title: "Plateforme",
    links: [
      { href: "/castings", label: "Castings ouverts" },
      { href: "/devenir-figurant", label: "Devenir figurant" },
      { href: "/pour-les-productions", label: "Pour les productions" },
    ],
  },
  {
    title: "Compte",
    links: [
      { href: "/login", label: "Connexion" },
      { href: "/signup", label: "Créer un compte" },
      { href: "/forgot-password", label: "Mot de passe oublié" },
    ],
  },
  {
    title: "Contact & légal",
    links: [
      { href: "mailto:contact@onset.app", label: "contact@onset.app" },
      { href: "/mentions-legales", label: "Mentions légales" },
    ],
  },
] as const

/** Public site footer shared by the landing and all (public) pages. */
export function SiteFooter() {
  return (
    <footer className="border-border/60 border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <p className="text-lg font-bold tracking-tight">ONSET</p>
          <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
            La plateforme qui connecte les productions audiovisuelles et les figurants en Belgique.
          </p>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title} className="space-y-3">
            <p className="text-sm font-semibold">{column.title}</p>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-border/60 border-t">
        <p className="text-muted-foreground mx-auto max-w-6xl px-6 py-5 text-xs">
          © {new Date().getFullYear()} ONSET — Tous droits réservés.
        </p>
      </div>
    </footer>
  )
}
