import {
  ArrowRight,
  Car,
  Check,
  Clapperboard,
  FileText,
  ListChecks,
  Mail,
  Send,
  Users,
} from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "ONSET pour les productions — Castez vos figurants sans friction | Belgique",
  description:
    "Publiez vos castings, recevez des candidatures qualifiées avec photos et profils complets, confirmez en un clic et convoquez automatiquement. La plateforme de casting figurants pensée pour les productions audiovisuelles en Belgique.",
  openGraph: {
    title: "ONSET pour les productions — Castez vos figurants sans friction",
    description:
      "Publiez vos castings, triez les candidatures, confirmez et convoquez vos figurants au même endroit.",
    type: "website",
  },
}

const PAIN_POINTS = [
  {
    pain: "Des appels à figurants postés dans dix groupes Facebook",
    gain: "Un casting publié une fois, visible par tous les figurants inscrits",
  },
  {
    pain: "Des candidatures qui arrivent par email, SMS et messagerie",
    gain: "Toutes les candidatures centralisées, avec photo, âge, ville et expérience",
  },
  {
    pain: "Des heures à recopier des listes dans Excel et à répondre un par un",
    gain: "Confirmation ou refus en un clic — même en masse — avec email automatique",
  },
] as const

const FEATURES = [
  {
    icon: Clapperboard,
    title: "Projets & castings illimités",
    description:
      "Structurez chaque production en projets et castings : type de rôle, tranche d'âge, lieu, date de tournage, places disponibles.",
  },
  {
    icon: Users,
    title: "Profils complets",
    description:
      "Chaque candidat arrive avec photo, âge, ville, expérience et coordonnées. Fini les candidatures anonymes à trier à l'aveugle.",
  },
  {
    icon: ListChecks,
    title: "Tri en un clic",
    description:
      "Confirmez ou refusez candidat par candidat, ou toute une sélection d'un coup. Le statut est visible en temps réel côté figurant.",
  },
  {
    icon: Mail,
    title: "Emails automatiques",
    description:
      "Confirmations et refus partent automatiquement, avec les infos du casting. Vous ne rédigez plus jamais le même email deux fois.",
  },
  {
    icon: Send,
    title: "Convocations groupées",
    description:
      "Envoyez date, heure, adresse et consignes à tous les figurants confirmés d'un projet en une seule action.",
  },
  {
    icon: Car,
    title: "Moins de no-shows",
    description:
      "Les figurants organisent leur covoiturage vers le plateau directement sur la plateforme — plus de présents le jour J.",
  },
] as const

const UPCOMING = [
  "Feuilles de service (call-sheets) PDF générées automatiquement",
  "Signature électronique des contrats de figuration",
  "Recherche avancée dans la base de figurants",
] as const

const STEPS = [
  {
    title: "Créez votre projet",
    description:
      "Décrivez le tournage, ajoutez vos castings avec leurs critères : type de rôle, âges, lieu, date, nombre de places.",
  },
  {
    title: "Recevez les candidatures",
    description:
      "Les figurants postulent avec leur profil complet. Vous triez par casting, avec photos et statuts à jour.",
  },
  {
    title: "Confirmez et convoquez",
    description:
      "Un clic pour confirmer, l'email part tout seul. Une action pour convoquer tous les confirmés du projet.",
  },
] as const

const LAUNCH_PLAN_FEATURES = [
  "Projets et castings illimités",
  "Candidatures illimitées",
  "Emails automatiques et convocations",
  "Accès aux profils complets des candidats",
] as const

const PRO_PLAN_FEATURES = [
  "Tout le plan Lancement",
  "Feuilles de service PDF",
  "Signature électronique des contrats",
  "Recherche avancée de figurants",
] as const

export default function PourLesProductionsPage() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-3xl text-center duration-700">
          <span className="border-border text-muted-foreground inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase">
            Pour les productions
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Vos figurants confirmés en quelques heures, pas en quelques semaines.
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed">
            Publiez vos castings, recevez des candidatures qualifiées, confirmez en un clic et
            convoquez automatiquement. ONSET remplace les groupes Facebook, les emails et les
            tableurs.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-6 text-base")}
            >
              Créer un compte production
              <ArrowRight data-icon="inline-end" />
            </Link>
            <a
              href="mailto:contact@onset.app"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 px-6 text-base"
              )}
            >
              Nous contacter
            </a>
          </div>
        </div>
      </section>

      {/* Argumentaire : avant / avec ONSET */}
      <section className="bg-muted/50 border-border/60 border-y">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              Le casting sauvage vous coûte des journées de production
            </h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-4">
            {PAIN_POINTS.map((point) => (
              <div
                key={point.pain}
                className="bg-background grid gap-4 rounded-xl border p-6 sm:grid-cols-2 sm:items-center"
              >
                <p className="text-muted-foreground text-sm leading-relaxed line-through decoration-1">
                  {point.pain}
                </p>
                <p className="flex items-start gap-3 text-sm leading-relaxed font-medium">
                  <Check className="mt-0.5 size-4 shrink-0 text-green-600" />
                  {point.gain}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features pro */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            Conçu pour le rythme d'un tournage
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Tout ce qu'il faut pour passer de l'appel à figurants au plateau, sans changer d'outil.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-xl border p-6">
              <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-muted/50 mt-6 rounded-xl border border-dashed p-6">
          <div className="flex items-start gap-3">
            <FileText className="text-muted-foreground mt-0.5 size-5 shrink-0" />
            <div>
              <h3 className="font-semibold">Bientôt sur ONSET</h3>
              <ul className="text-muted-foreground mt-2 space-y-1 text-sm leading-relaxed">
                {UPCOMING.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="bg-muted/50 border-border/60 border-y">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              Du casting au plateau en trois étapes
            </h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="bg-primary text-primary-foreground mx-auto flex size-12 items-center justify-center rounded-full text-lg font-semibold">
                  {index + 1}
                </div>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            Un tarif simple, un lancement gratuit
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Pendant la phase de lancement, la plateforme est entièrement gratuite pour les
            productions. Les tarifs définitifs seront annoncés avant toute facturation.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
          <div className="border-primary/40 relative rounded-xl border-2 p-8">
            <span className="bg-primary text-primary-foreground absolute -top-3 left-8 rounded-full px-3 py-0.5 text-xs font-semibold">
              Disponible maintenant
            </span>
            <h3 className="text-lg font-semibold">Lancement</h3>
            <p className="mt-2 text-3xl font-bold">
              0€
              <span className="text-muted-foreground text-sm font-normal">
                {" "}
                / pendant le lancement
              </span>
            </p>
            <ul className="mt-6 space-y-3">
              {LAUNCH_PLAN_FEATURES.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                  <Check className="mt-0.5 size-4 shrink-0 text-green-600" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/signup" className={cn(buttonVariants(), "mt-8 w-full")}>
              Commencer gratuitement
            </Link>
          </div>

          <div className="rounded-xl border p-8">
            <h3 className="text-lg font-semibold">Pro</h3>
            <p className="text-muted-foreground mt-2 text-3xl font-bold">Bientôt</p>
            <ul className="mt-6 space-y-3">
              {PRO_PLAN_FEATURES.map((item) => (
                <li
                  key={item}
                  className="text-muted-foreground flex items-start gap-3 text-sm leading-relaxed"
                >
                  <Check className="mt-0.5 size-4 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="mailto:contact@onset.app"
              className={cn(buttonVariants({ variant: "outline" }), "mt-8 w-full")}
            >
              Être prévenu du lancement
            </a>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-6 pb-16 sm:pb-24">
        <div className="bg-primary text-primary-foreground rounded-2xl px-6 py-14 text-center sm:px-12">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            Votre prochain tournage se caste sur ONSET
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed opacity-80">
            Créez votre compte production et publiez votre premier casting en quelques minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "h-11 px-6 text-base"
              )}
            >
              Créer un compte production
              <ArrowRight data-icon="inline-end" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
