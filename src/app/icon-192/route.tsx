import { pwaIconResponse } from "@/lib/pwa-icon"

export const dynamic = "force-static"

export function GET(): Response {
  return pwaIconResponse(192)
}
