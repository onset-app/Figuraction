import { WifiOff } from "lucide-react"
import type { Metadata } from "next"
import { RetryButton } from "./retry-button"

export const metadata: Metadata = {
  title: "Hors ligne",
  robots: { index: false },
}

/**
 * Offline fallback, precached by the service worker and served when a
 * navigation fails without a cached response (see fallbacks in src/sw.ts).
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="bg-muted flex size-14 items-center justify-center rounded-full">
        <WifiOff className="size-6" />
      </div>
      <div className="max-w-md space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Vous êtes hors ligne</h1>
        <p className="text-muted-foreground leading-relaxed">
          Impossible de charger cette page sans connexion internet. Vérifiez votre réseau puis
          réessayez.
        </p>
      </div>
      <RetryButton />
    </main>
  )
}
