import { Resend } from "resend"
import { getResendApiKey } from "./env"

/**
 * Server-side Resend client for sending transactional emails.
 * Instantiated lazily so that missing configuration only fails when an email
 * is actually sent, not at import time.
 */
let client: Resend | null = null

export function getResendClient(): Resend {
  if (!client) {
    client = new Resend(getResendApiKey())
  }

  return client
}
