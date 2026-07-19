/**
 * Reads and validates the Resend environment variable.
 * Throws at call time if the key is missing, surfacing misconfiguration
 * early instead of failing deep inside the Resend client.
 */
export function getResendApiKey() {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new Error("Missing Resend env var: RESEND_API_KEY must be set.")
  }

  return apiKey
}

/**
 * The sender address for all transactional emails, from RESEND_FROM.
 *
 * Throws when unset instead of falling back: a hardcoded default would either
 * point at an unverified domain (every send rejected by Resend, visible only
 * in Sentry) or silently use the shared onboarding sender (which only delivers
 * to the Resend account owner). The senders call this inside their try/catch,
 * so a missing variable degrades to a reported send failure, never a crash.
 */
export function getEmailFrom(): string {
  const from = process.env.RESEND_FROM
  if (!from) {
    throw new Error("Missing Resend env var: RESEND_FROM must be set (e.g. 'ONSET <noreply@…>').")
  }
  return from
}
