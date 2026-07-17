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
 * The verified sender address used for all transactional emails.
 * Falls back to Resend's shared onboarding domain when no custom domain
 * is configured (useful in development).
 */
export const EMAIL_FROM = process.env.RESEND_FROM ?? "OnSet <noreply@onset.app>"
