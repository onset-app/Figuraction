import { Shield } from "lucide-react"

/**
 * Back-office placeholder — the real admin dashboard is Phase 2 (ticket #13).
 * This page exists so the admin nav entry resolves instead of 404ing; access
 * is already restricted to admins by the proxy role guard.
 */
export default function AdminPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
      <Shield className="text-muted-foreground size-10" />
      <h2 className="text-xl font-semibold">Back-office</h2>
      <p className="text-muted-foreground max-w-md text-sm">
        Le back-office d'administration (métriques, gestion des utilisateurs et des projets) arrive
        dans une prochaine version.
      </p>
    </div>
  )
}
