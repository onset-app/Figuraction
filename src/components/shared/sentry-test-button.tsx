"use client"

import { Button } from "@/components/ui/button"

/**
 * Temporary button to verify Sentry error reporting is wired correctly.
 * Remove once Sentry has been confirmed working in production (ticket #10).
 */
export function SentryTestButton() {
  return (
    <Button
      variant="destructive"
      onClick={() => {
        throw new Error("Sentry test error — triggered from the homepage button")
      }}
    >
      Tester Sentry (déclencher une erreur)
    </Button>
  )
}
