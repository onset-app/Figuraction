"use client"

import { CalendarClock, Car, Mail, MapPin, Phone, Trash2, Users } from "lucide-react"
import { useMemo, useState } from "react"
import type { CarpoolListItem } from "@/actions/carpools"
import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDateFr, toDateString } from "@/lib/utils"

const ALL_PROJECTS = "all"

/** Build the `mailto:`/`tel:` href for a carpool's contact method. */
function contactHref(method: CarpoolListItem["contactMethod"], value: string): string {
  return method === "email" ? `mailto:${value}` : `tel:${value}`
}

/**
 * The carpool board: date + project filters, then a card per offer. Each card
 * links to the driver's contact, and shows "Complet"/"Supprimer" only for the
 * current user's own offers.
 */
export function CarpoolList({
  carpools,
  currentUserId,
  onSetFull,
  onDelete,
  pendingId,
}: {
  carpools: CarpoolListItem[]
  currentUserId: string | null
  onSetFull: (id: string, isFull: boolean) => void
  onDelete: (id: string) => void
  pendingId: string | null
}) {
  // Defaults to today so stale (past) trips don't clutter the board; clearing
  // the date input shows the full history.
  const [dateFrom, setDateFrom] = useState(() => toDateString(new Date()))
  const [projectId, setProjectId] = useState<string>(ALL_PROJECTS)
  const today = toDateString(new Date())

  // Filter options: the distinct projects actually attached to a carpool.
  const projectOptions = useMemo(() => {
    const seen = new Map<string, string>()
    for (const carpool of carpools) {
      if (carpool.projectId && carpool.projectTitle) {
        seen.set(carpool.projectId, carpool.projectTitle)
      }
    }
    return [...seen].map(([id, title]) => ({ id, title }))
  }, [carpools])

  const filtered = useMemo(
    () =>
      carpools.filter((carpool) => {
        if (dateFrom && carpool.departureDate < dateFrom) return false
        if (projectId !== ALL_PROJECTS && carpool.projectId !== projectId) return false
        return true
      }),
    [carpools, dateFrom, projectId]
  )

  const hasFilters = dateFrom !== today || projectId !== ALL_PROJECTS

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="filterDate">À partir du</Label>
          <Input
            id="filterDate"
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="w-auto"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filterProject">Projet</Label>
          <Select value={projectId} onValueChange={(value) => setProjectId(value ?? ALL_PROJECTS)}>
            <SelectTrigger id="filterProject" className="w-56">
              <SelectValue>
                {(value: string) =>
                  value === ALL_PROJECTS
                    ? "Tous les projets"
                    : (projectOptions.find((p) => p.id === value)?.title ?? "Projet")
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_PROJECTS}>Tous les projets</SelectItem>
              {projectOptions.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            onClick={() => {
              setDateFrom(today)
              setProjectId(ALL_PROJECTS)
            }}
          >
            Réinitialiser
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Car}
          title="Aucun trajet."
          description={
            hasFilters
              ? "Aucun covoiturage ne correspond à ces filtres."
              : "Aucun covoiturage proposé pour le moment. Publiez le premier ci-dessus."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((carpool) => {
            const isOwner = currentUserId !== null && carpool.driverId === currentUserId
            const isPending = pendingId === carpool.id
            return (
              <Card key={carpool.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{carpool.driverName}</CardTitle>
                    {carpool.isFull ? (
                      <Badge variant="secondary">Complet</Badge>
                    ) : (
                      <Badge variant="default">
                        {carpool.seatsAvailable} place{carpool.seatsAvailable !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                  {carpool.projectTitle && (
                    <p className="text-muted-foreground text-sm">{carpool.projectTitle}</p>
                  )}
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-2 text-sm">
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4 shrink-0 text-muted-foreground" />
                    {carpool.departureArea}
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
                    {formatDateFr(carpool.departureDate)} à {carpool.departureTime.slice(0, 5)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="size-4 shrink-0 text-muted-foreground" />
                    {carpool.seatsAvailable} place{carpool.seatsAvailable !== 1 ? "s" : ""}{" "}
                    disponible{carpool.seatsAvailable !== 1 ? "s" : ""}
                  </p>

                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    <a
                      href={contactHref(carpool.contactMethod, carpool.contactValue)}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      {carpool.contactMethod === "email" ? (
                        <Mail className="size-4" />
                      ) : (
                        <Phone className="size-4" />
                      )}
                      Contacter
                    </a>

                    {isOwner && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => onSetFull(carpool.id, !carpool.isFull)}
                      >
                        {carpool.isFull ? "Rouvrir" : "Marquer complet"}
                      </Button>
                    )}
                    {isOwner && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => onDelete(carpool.id)}
                        className="text-destructive hover:text-destructive"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
