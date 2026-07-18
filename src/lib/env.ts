/**
 * The public origin of the app (no trailing slash), e.g. for links embedded in
 * emails. Throws when unset so a misconfigured deployment fails loudly instead
 * of silently sending emails whose links point at "undefined/...".
 *
 * Build-time consumers that can tolerate a fallback (metadataBase, sitemap,
 * robots) read NEXT_PUBLIC_APP_URL directly with a localhost default instead.
 */
export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL — set it in .env.local (and on Vercel).")
  }
  return url.replace(/\/$/, "")
}
