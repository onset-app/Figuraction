import { ArrowRight, Camera, CheckCircle2, Clock, MapPin, Sparkles, UserRound } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Devenir figurant en Belgique : le guide complet | ONSET",
  description:
    "Comment devenir figurant en Belgique ? Conditions, castings à Bruxelles et en Wallonie, rémunération, conseils pour être sélectionné : le guide complet pour décrocher votre premier tournage.",
  openGraph: {
    title: "Devenir figurant en Belgique : le guide complet",
    description:
      "Conditions, castings, rémunération, conseils : tout pour décrocher votre premier rôle de figurant en Belgique.",
    type: "article",
  },
}

const WHY_BECOME = [
  {
    icon: Sparkles,
    title: "Vivre les coulisses d'un tournage",
    description:
      "Séries, films, clips, publicités : vous découvrez de l'intérieur comment se fabrique ce que vous regardez à l'écran.",
  },
  {
    icon: UserRound,
    title: "Aucune expérience requise",
    description:
      "La plupart des rôles de figuration ne demandent ni formation ni CV artistique. Être naturel et ponctuel suffit.",
  },
  {
    icon: Clock,
    title: "Compatible avec votre emploi du temps",
    description:
      "Vous postulez uniquement aux tournages qui vous conviennent, souvent à la journée, en semaine ou le week-end.",
  },
  {
    icon: MapPin,
    title: "Partout en Belgique",
    description:
      "Bruxelles, Liège, Namur, Charleroi, Gand, Anvers : les productions tournent dans tout le pays, près de chez vous.",
  },
] as const

const STEPS = [
  {
    title: "Créez votre profil gratuitement",
    description:
      "Inscrivez-vous sur ONSET et complétez votre profil : ville, âge, niveau d'expérience et une courte présentation. C'est votre carte de visite auprès des productions.",
  },
  {
    title: "Ajoutez une photo naturelle",
    description:
      "Une photo récente, nette, sans filtre ni lunettes de soleil. Les directeurs de casting cherchent des visages réels, pas des books professionnels.",
  },
  {
    title: "Parcourez les castings ouverts",
    description:
      "Filtrez par ville, date ou type de rôle. Chaque annonce précise le lieu de tournage, la date, la tranche d'âge recherchée et le nombre de places.",
  },
  {
    title: "Postulez en quelques clics",
    description:
      "Votre profil est envoyé automatiquement avec votre candidature. Ajoutez un message personnel si vous le souhaitez, puis suivez son statut en temps réel.",
  },
  {
    title: "Recevez votre confirmation",
    description:
      "Si vous êtes sélectionné, vous recevez un email de confirmation puis une convocation avec l'heure, l'adresse et les consignes du tournage.",
  },
] as const

const TIPS = [
  "Utilisez une photo récente et naturelle — c'est le premier critère de sélection",
  "Complétez tout votre profil : un profil vide est rarement retenu",
  "Ne postulez qu'aux dates où vous êtes réellement disponible",
  "Répondez vite : les places partent dans les premières heures",
  "Le jour J, soyez ponctuel et suivez les consignes de la régie",
  "Prévoyez de la patience : une journée de tournage comporte beaucoup d'attente",
] as const

const FAQ = [
  {
    question: "Faut-il de l'expérience pour devenir figurant ?",
    answer:
      "Non. La figuration ne demande aucune formation ni expérience préalable : les productions recherchent des personnes de tous âges et de tous profils, capables d'être naturelles devant la caméra. Sur ONSET, vous indiquez simplement votre niveau (débutant, première fois ou confirmé).",
  },
  {
    question: "Être figurant, est-ce rémunéré ?",
    answer:
      "Cela dépend de la production. Selon les tournages, la figuration peut être défrayée (transport, repas) ou rémunérée par un cachet. Les conditions sont précisées par la production pour chaque casting — lisez bien l'annonce avant de postuler.",
  },
  {
    question: "Quel âge faut-il avoir pour s'inscrire ?",
    answer:
      "ONSET est accessible à partir de 16 ans. Chaque casting précise la tranche d'âge recherchée : certains tournages cherchent des jeunes, d'autres des seniors — tous les profils sont demandés.",
  },
  {
    question: "Où ont lieu les castings de figurants en Belgique ?",
    answer:
      "Partout : Bruxelles concentre beaucoup de tournages (séries, films, publicités), mais les productions castent aussi régulièrement à Liège, Namur, Charleroi, Mons, Gand ou Anvers. Chaque annonce ONSET indique le lieu exact du tournage.",
  },
  {
    question: "Comment se passe une journée de tournage ?",
    answer:
      "Vous arrivez à l'heure indiquée sur votre convocation, la régie vous accueille et vous explique les scènes. Attendez-vous à de l'attente entre les prises : apportez de quoi vous occuper. Les repas sont généralement prévus par la production.",
  },
  {
    question: "Faut-il un agent ou payer pour s'inscrire ?",
    answer:
      "Non. L'inscription sur ONSET est gratuite pour les figurants, et vous postulez directement auprès des productions, sans intermédiaire. Méfiez-vous des sites ou agences qui font payer l'inscription à des castings.",
  },
  {
    question: "Puis-je retirer ma candidature ?",
    answer:
      "Oui, tant qu'elle n'a pas été traitée par la production, vous pouvez retirer votre candidature depuis votre espace « Mes candidatures ». Si vous êtes déjà confirmé, prévenez la production au plus vite.",
  },
] as const

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
}

export default function DevenirFigurantPage() {
  return (
    <main>
      {/* Static SEO structured data (FAQPage rich results) — no user data involved. */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD built from constants above
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-3xl text-center duration-700">
          <span className="border-border text-muted-foreground inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase">
            Guide figurant
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Devenir figurant en Belgique&nbsp;: le guide complet
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed">
            Envie de participer à un tournage de film, de série ou de publicité&nbsp;? Voici tout ce
            qu'il faut savoir pour décrocher vos premiers castings de figurant à Bruxelles et
            partout en Belgique — sans expérience et sans agent.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-6 text-base")}
            >
              Créer mon profil gratuit
              <ArrowRight data-icon="inline-end" />
            </Link>
            <Link
              href="/castings"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 px-6 text-base"
              )}
            >
              Voir les castings ouverts
            </Link>
          </div>
        </div>
      </section>

      {/* Qu'est-ce qu'un figurant */}
      <section className="bg-muted/50 border-border/60 border-y">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              Qu'est-ce qu'un figurant, exactement&nbsp;?
            </h2>
            <div className="text-muted-foreground mt-6 space-y-4 leading-relaxed">
              <p>
                Un figurant (ou «&nbsp;extra&nbsp;») apparaît à l'écran sans texte à jouer&nbsp;: un
                passant dans une rue, un client de café, un spectateur dans une foule. Les figurants
                donnent vie aux décors — sans eux, chaque scène semblerait vide.
              </p>
              <p>
                Les productions belges et internationales qui tournent en Belgique recherchent en
                permanence des profils variés&nbsp;: tous âges, toutes silhouettes, tous styles. Nul
                besoin de savoir jouer la comédie&nbsp;: il s'agit d'être naturel et de suivre les
                indications du réalisateur.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_BECOME.map((item) => (
              <div key={item.title} className="bg-background rounded-xl border p-6">
                <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                  <item.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guide en 5 étapes */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            Comment devenir figurant en 5 étapes
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            De l'inscription à votre première convocation sur un plateau.
          </p>
        </div>

        <ol className="mx-auto mt-12 max-w-3xl space-y-6">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-5 rounded-xl border p-6">
              <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-full font-semibold">
                {index + 1}
              </span>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Conseils */}
      <section className="bg-muted/50 border-border/60 border-y">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3">
              <Camera className="size-6" />
              <h2 className="text-3xl font-semibold tracking-tight text-balance">
                Nos conseils pour être sélectionné
              </h2>
            </div>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {TIPS.map((tip) => (
                <li
                  key={tip}
                  className="bg-background flex items-start gap-3 rounded-xl border p-4 text-sm leading-relaxed"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-balance">
            Questions fréquentes
          </h2>
          <div className="mt-10 space-y-4">
            {FAQ.map((item) => (
              <details key={item.question} className="group rounded-xl border p-6">
                <summary className="cursor-pointer list-none font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {item.question}
                    <span className="text-muted-foreground transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-6 pb-16 sm:pb-24">
        <div className="bg-primary text-primary-foreground rounded-2xl px-6 py-14 text-center sm:px-12">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            Votre premier tournage commence ici
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed opacity-80">
            Créez votre profil gratuitement et postulez aux castings ouverts partout en Belgique.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "h-11 px-6 text-base"
              )}
            >
              Devenir figurant
              <ArrowRight data-icon="inline-end" />
            </Link>
            <Link
              href="/castings"
              className={cn(
                buttonVariants({ variant: "link", size: "lg" }),
                "text-primary-foreground h-11 px-6 text-base"
              )}
            >
              Parcourir les castings
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
