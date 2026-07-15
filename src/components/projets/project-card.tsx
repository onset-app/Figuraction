import Link from "next/link"
import type { ProjectListItem } from "@/actions/projects"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProjectStatus } from "@/types/enums"

const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Brouillon",
  open: "Ouvert",
  closed: "Fermé",
  archived: "Archivé",
}

const STATUS_VARIANTS: Record<ProjectStatus, "default" | "outline" | "secondary" | "ghost"> = {
  draft: "outline",
  open: "default",
  closed: "secondary",
  archived: "ghost",
}

/** Format a `YYYY-MM-DD` string as `DD/MM/YYYY` without going through Date/timezone conversion. */
function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-")
  return `${day}/${month}/${year}`
}

function formatDateRange(start: string | null, end: string | null): string | null {
  if (!start && !end) return null
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`
  return formatDate(start ?? (end as string))
}

export function ProjectCard({ project }: { project: ProjectListItem }) {
  const dateRange = formatDateRange(project.shootDateStart, project.shootDateEnd)
  const status = (project.status as ProjectStatus) ?? "draft"

  return (
    <Link href={`/app/projets/${project.id}`}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <CardTitle className="text-base">{project.title}</CardTitle>
          <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
        </CardHeader>
        <CardContent className="space-y-1 text-muted-foreground text-sm">
          {project.shootLocation && <p>{project.shootLocation}</p>}
          {dateRange && <p>{dateRange}</p>}
          <p>
            {project.castingsCount} casting{project.castingsCount !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
