import { Ban, CheckCircle2, Clock, XCircle } from "lucide-react"
import type { ComponentProps } from "react"
import { Badge } from "@/components/ui/badge"
import type { ApplicationStatus } from "@/types/enums"

type BadgeVariant = ComponentProps<typeof Badge>["variant"]

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; variant: BadgeVariant; icon: typeof Clock }
> = {
  pending: { label: "En attente", variant: "outline", icon: Clock },
  confirmed: { label: "Confirmée", variant: "default", icon: CheckCircle2 },
  rejected: { label: "Refusée", variant: "destructive", icon: XCircle },
  withdrawn: { label: "Retirée", variant: "secondary", icon: Ban },
}

/** Coloured badge for an application status, shared across figurant/production views. */
export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { label, variant, icon: Icon } = STATUS_CONFIG[status]
  return (
    <Badge variant={variant}>
      <Icon data-icon="inline-start" />
      {label}
    </Badge>
  )
}
