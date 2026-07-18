import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cache } from "react"
import { getCastingDetail } from "@/actions/castings"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { cn, formatDateFr } from "@/lib/utils"
import { ROLE_TYPE_LABELS } from "@/schemas/casting"
import type { RoleType } from "@/types/enums"

/** Dedupe the fetch between generateMetadata and the page render. */
const getCasting = cache(getCastingDetail)

function formatAgeRange(ageMin: number | null, ageMax: number | null): string | null {
  if (ageMin != null && ageMax != null) return `${ageMin}–${ageMax} ans`
  if (ageMin != null) return `${ageMin}+ ans`
  if (ageMax != null) return `≤ ${ageMax} ans`
  return null
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const casting = await getCasting(id)
  if (!casting) {
    return { title: "Casting introuvable" }
  }

  const title = casting.location
    ? `${casting.title} — casting à ${casting.location}`
    : `${casting.title} — casting figurants`
  const description = truncate(
    casting.description ??
      `Casting ouvert pour « ${casting.project.title} »${
        casting.location ? ` à ${casting.location}` : ""
      } — tournage le ${formatDateFr(casting.shootDate)}. Postulez gratuitement sur ONSET.`,
    160
  )

  return {
    title,
    description,
    alternates: { canonical: `/castings/${casting.id}` },
  }
}

export default async function PublicCastingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data: userData }, casting] = await Promise.all([supabase.auth.getUser(), getCasting(id)])
  if (!casting) {
    notFound()
  }

  const isAuthenticated = Boolean(userData.user)
  const applyHref = isAuthenticated ? `/app/castings/${casting.id}` : "/signup"
  const ageRange = formatAgeRange(casting.ageMin, casting.ageMax)

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-muted-foreground text-sm">
        <Link href="/castings" className="hover:text-foreground transition-colors">
          Castings
        </Link>{" "}
        / {casting.project.title}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {casting.title}
        </h1>
        {casting.roleType && (
          <Badge variant="secondary">{ROLE_TYPE_LABELS[casting.roleType as RoleType]}</Badge>
        )}
      </div>

      <div className="text-muted-foreground mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {casting.location && (
          <span className="flex items-center gap-2">
            <MapPin className="size-4" />
            {casting.location}
          </span>
        )}
        <span className="flex items-center gap-2">
          <CalendarDays className="size-4" />
          Tournage le {formatDateFr(casting.shootDate)}
        </span>
        <span className="flex items-center gap-2">
          <Users className="size-4" />
          {casting.spotsAvailable} place{casting.spotsAvailable !== 1 ? "s" : ""}
          {ageRange ? ` · ${ageRange}` : ""}
        </span>
      </div>

      {casting.description && (
        <p className="mt-8 leading-relaxed whitespace-pre-line">{casting.description}</p>
      )}

      <div className="bg-muted/50 mt-10 rounded-xl border p-6">
        <h2 className="font-semibold">À propos du projet</h2>
        <p className="mt-1 text-sm font-medium">{casting.project.title}</p>
        {casting.project.description && (
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {casting.project.description}
          </p>
        )}
      </div>

      <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Link
          href={applyHref}
          className={cn(buttonVariants({ size: "lg" }), "h-11 px-6 text-base")}
        >
          {isAuthenticated ? "Voir et postuler" : "Créer mon profil et postuler"}
          <ArrowRight data-icon="inline-end" />
        </Link>
        {!isAuthenticated && (
          <p className="text-muted-foreground text-sm">
            Déjà inscrit&nbsp;?{" "}
            <Link href="/login" className="text-foreground underline underline-offset-4">
              Connectez-vous
            </Link>
          </p>
        )}
      </div>
    </main>
  )
}
