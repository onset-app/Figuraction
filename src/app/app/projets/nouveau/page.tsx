"use client"

import { RoleGuard } from "@/components/layout/role-guard"
import { ProjectForm } from "@/components/projets/project-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NouveauProjetPage() {
  return (
    <RoleGuard allow={["production", "admin"]}>
      <div className="max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Nouveau projet</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectForm />
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
