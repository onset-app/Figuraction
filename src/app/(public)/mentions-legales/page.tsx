import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de la plateforme ONSET.",
  robots: { index: false },
}

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Mentions légales</h1>

      <div className="text-muted-foreground mt-8 space-y-8 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-foreground text-base font-semibold">Éditeur</h2>
          <p>
            ONSET — plateforme de mise en relation entre productions audiovisuelles et figurants en
            Belgique. Les informations légales complètes de l'éditeur (dénomination sociale, siège,
            numéro d'entreprise) seront publiées ici avant l'ouverture du service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-foreground text-base font-semibold">Contact</h2>
          <p>
            Pour toute question relative à la plateforme&nbsp;:{" "}
            <a
              href="mailto:contact@onset.app"
              className="text-foreground underline underline-offset-4"
            >
              contact@onset.app
            </a>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-foreground text-base font-semibold">Hébergement</h2>
          <p>
            Le site est hébergé par Vercel Inc. (Walnut, Californie, États-Unis). Les données sont
            stockées par Supabase sur des serveurs situés dans l'Union européenne.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-foreground text-base font-semibold">Données personnelles</h2>
          <p>
            Les données collectées sont utilisées exclusivement pour le fonctionnement de la
            plateforme (gestion des castings, candidatures et communication associée). Conformément
            au RGPD, vous pouvez exercer vos droits d'accès, de rectification et de suppression en
            écrivant à{" "}
            <a
              href="mailto:contact@onset.app"
              className="text-foreground underline underline-offset-4"
            >
              contact@onset.app
            </a>
            . Une politique de confidentialité détaillée sera publiée avant l'ouverture du service.
          </p>
        </section>
      </div>
    </main>
  )
}
