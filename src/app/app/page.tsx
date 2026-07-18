import { redirect } from "next/navigation"

/** Bare /app has no content of its own — land on the dashboard. */
export default function AppIndexPage() {
  redirect("/app/dashboard")
}
