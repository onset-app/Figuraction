"use client"

import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

/** Chromium-only event, not in the standard DOM typings. */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const DISMISSED_KEY = "onset-install-banner-dismissed"

/**
 * "Add to Home Screen" banner. Browsers only fire `beforeinstallprompt` when
 * the app is installable (manifest + service worker + not already installed),
 * so the banner stays hidden everywhere else. A dismissal is remembered in
 * localStorage and never asked again.
 */
export function InstallBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      // Keep the browser's mini-infobar from showing alongside our banner.
      event.preventDefault()
      if (localStorage.getItem(DISMISSED_KEY)) {
        return
      }
      setPromptEvent(event as BeforeInstallPromptEvent)
    }
    function onAppInstalled() {
      setPromptEvent(null)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    window.addEventListener("appinstalled", onAppInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
      window.removeEventListener("appinstalled", onAppInstalled)
    }
  }, [])

  if (!promptEvent) {
    return null
  }
  const event = promptEvent

  async function install() {
    await event.prompt()
    const { outcome } = await event.userChoice
    if (outcome === "dismissed") {
      localStorage.setItem(DISMISSED_KEY, "1")
    }
    setPromptEvent(null)
  }

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1")
    setPromptEvent(null)
  }

  return (
    <div className="bg-background fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-xl border p-4 shadow-lg">
      <div className="flex-1">
        <p className="text-sm font-semibold">Installer ONSET</p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Ajoutez l'application à votre écran d'accueil pour un accès rapide.
        </p>
      </div>
      <Button size="sm" onClick={install}>
        Installer
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Fermer" onClick={dismiss}>
        <X />
      </Button>
    </div>
  )
}
