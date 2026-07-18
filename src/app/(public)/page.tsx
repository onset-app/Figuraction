import {
  ArrowRight,
  BadgeCheck,
  Car,
  Check,
  Clapperboard,
  ListChecks,
  Mail,
  Send,
  UserRoundPlus,
  X,
} from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "ONSET — Le casting de figurants, enfin simple | Belgique",
  description:
    "ONSET connecte les productions audiovisuelles et les figurants en Belgique. Publiez vos castings, postulez en quelques clics, suivez vos candidatures et organisez vos tournages au même endroit.",
  openGraph: {
    title: "ONSET — Le casting de figurants, enfin simple",
    description:
      "La plateforme qui connecte les productions audiovisuelles et les figurants en Belgique.",
    type: "website",
  },
}

const OLD_WAY = [
  "Des groupes WhatsApp qui débordent",
  "Des candidatures perdues dans les emails",
  "Des listes Excel copiées-collées à la main",
  "Aucune visibilité sur le statut de sa candidature",
] as const

const NEW_WAY = [
  "Tous les castings ouverts au même endroit",
  "Candidature en quelques clics, profil pré-rempli",
  "Confirmations et refus notifiés automatiquement",
  "Covoiturage organisé entre figurants",
] as const

const FEATURES = [
  {
    icon: Clapperboard,
    title: "Castings centralisés",
    description:
      "Les productions publient leurs projets et castings ; les figurants les découvrent, filtrent par ville, date ou type de rôle, et postulent directement.",
  },
  {
    icon: ListChecks,
    title: "Suivi des candidatures",
    description:
      "Chaque candidature a un statut clair — en attente, confirmée, refusée. Fini les relances pour savoir où on en est.",
  },
  {
    icon: Mail,
    title: "Emails automatiques",
    description:
      "Confirmation, refus, convocation : les figurants sont prévenus automatiquement à chaque étape, sans effort côté production.",
  },
  {
    icon: Car,
    title: "Covoiturage intégré",
    description:
      "Les figurants proposent et trouvent des trajets vers le lieu de tournage, directement depuis la plateforme.",
  },
] as const

const STEPS = [
  {
    icon: UserRoundPlus,
    title: "Créez votre profil",
    description:
      "Inscrivez-vous gratuitement, complétez votre profil avec photo, ville et expérience. Il servira à toutes vos candidatures.",
  },
  {
    icon: Send,
    title: "Postulez aux castings",
    description:
      "Parcourez les castings ouverts en Belgique et postulez en quelques clics — votre profil fait le travail à votre place.",
  },
  {
    icon: BadgeCheck,
    title: "Recevez votre confirmation",
    description:
      "La production confirme votre participation, vous recevez votre convocation par email avec toutes les infos du tournage.",
  },
] as const

const TESTIMONIALS = [
  {
    quote:
      "Avant, je ratais des castings parce que l'info circulait dans trois groupes WhatsApp différents. Maintenant tout est au même endroit.",
    name: "Marie L.",
    role: "Figurante — Liège",
  },
  {
    quote:
      "Gérer 80 figurants sur un tournage avec des fichiers Excel, c'était l'enfer. ONSET nous a fait gagner des journées entières.",
    name: "Thomas V.",
    role: "Régisseur — Bruxelles",
  },
  {
    quote:
      "J'ai su en temps réel que ma candidature était confirmée, et j'ai trouvé un covoiturage pour le tournage dans la foulée.",
    name: "Sofia D.",
    role: "Figurante — Namur",
  },
] as const

export default function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-3xl text-center duration-700">
          <span className="border-border text-muted-foreground inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase">
            Plateforme de casting figurants en Belgique
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-6xl">
            Le casting de figurants, enfin simple.
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed">
            ONSET connecte les productions audiovisuelles et les figurants en Belgique. Publiez vos
            castings, postulez en quelques clics, gérez tout au même endroit.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-6 text-base")}
            >
              Je veux devenir figurant
              <ArrowRight data-icon="inline-end" />
            </Link>
            <Link
              href="/pour-les-productions"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 px-6 text-base"
              )}
            >
              Je suis une production
            </Link>
          </div>
          <Link
            href="/castings"
            className="text-muted-foreground hover:text-foreground mt-6 inline-block text-sm underline underline-offset-4 transition-colors"
          >
            Voir les castings ouverts sans créer de compte
          </Link>
        </div>
      </section>

      {/* Problème / Solution */}
      <section className="bg-muted/50 border-border/60 border-y">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              Le casting de figurants n'a pas changé depuis 20 ans
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Groupes WhatsApp, emails éparpillés, tableurs Excel : tout le monde perd du temps, des
              deux côtés de la caméra.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
            <div className="bg-background rounded-xl border p-6">
              <p className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                Aujourd'hui
              </p>
              <ul className="mt-4 space-y-3">
                {OLD_WAY.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                    <X className="text-destructive mt-0.5 size-4 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-background border-primary/20 rounded-xl border p-6">
              <p className="text-sm font-semibold tracking-wide uppercase">Avec ONSET</p>
              <ul className="mt-4 space-y-3">
                {NEW_WAY.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                    <Check className="mt-0.5 size-4 shrink-0 text-green-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            Tout le tournage, au même endroit
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            De la publication du casting à la convocation sur le plateau, ONSET couvre tout le flux.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
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
      </section>

      {/* Comment ça marche */}
      <section className="bg-muted/50 border-border/60 border-y">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              Comment ça marche&nbsp;?
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Trois étapes pour passer de spectateur à figurant.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="bg-primary text-primary-foreground mx-auto flex size-12 items-center justify-center rounded-full">
                  <step.icon className="size-5" />
                </div>
                <p className="text-muted-foreground mt-4 text-xs font-semibold tracking-wide uppercase">
                  Étape {index + 1}
                </p>
                <h3 className="mt-1 font-semibold">{step.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground mt-12 text-center text-sm">
            Vous êtes une production&nbsp;?{" "}
            <Link
              href="/pour-les-productions"
              className="text-foreground font-medium underline underline-offset-4"
            >
              Découvrez comment publier vos castings
            </Link>
          </p>
        </div>
      </section>

      {/* Témoignages */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            Ils sont déjà sur le plateau
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <figure key={testimonial.name} className="flex flex-col rounded-xl border p-6">
              <blockquote className="flex-1 text-sm leading-relaxed">
                «&nbsp;{testimonial.quote}&nbsp;»
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <span className="bg-muted flex size-9 items-center justify-center rounded-full text-xs font-semibold">
                  {testimonial.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </span>
                <span>
                  <span className="block text-sm font-medium">{testimonial.name}</span>
                  <span className="text-muted-foreground block text-xs">{testimonial.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-6 pb-16 sm:pb-24">
        <div className="bg-primary text-primary-foreground rounded-2xl px-6 py-14 text-center sm:px-12">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            Prêt à rejoindre le plateau&nbsp;?
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed opacity-80">
            Créez votre compte gratuitement — figurant ou production, tout commence ici.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "h-11 px-6 text-base"
              )}
            >
              Créer mon compte
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
