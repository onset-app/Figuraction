import { Badge } from "@/components/ui/badge"
import { PROJECT_STATUS_LABELS } from "@/schemas/project"
import type { ProjectStatus } from "@/types/enums"

const STATUS_VARIANTS: Record<ProjectStatus, "default" | "outline" | "secondary" | "ghost"> = {
  draft: "outline",
  open: "default",
  closed: "secondary",
  archived: "ghost",
}

/** Status badge for a project, shared by the project cards and detail page. */
export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{PROJECT_STATUS_LABELS[status]}</Badge>
}
