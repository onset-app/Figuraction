import Link from "next/link"
import type { ProjectListItem } from "@/actions/projects"
import { ProjectStatusBadge } from "@/components/projets/project-status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateRangeShortFr } from "@/lib/utils"

export function ProjectCard({ project }: { project: ProjectListItem }) {
  const dateRange = formatDateRangeShortFr(project.shootDateStart, project.shootDateEnd)

  return (
    <Link href={`/app/projets/${project.id}`}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <CardTitle className="text-base">{project.title}</CardTitle>
          <ProjectStatusBadge status={project.status} />
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
