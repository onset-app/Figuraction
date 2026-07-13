import { withSentryConfig } from "@sentry/nextjs"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // SENTRY_DSN is not a secret (it only identifies the ingest endpoint), so it's
  // safe to inline into the client bundle without a NEXT_PUBLIC_ prefix — this
  // keeps a single env var name shared by client, server, and edge configs.
  env: {
    SENTRY_DSN: process.env.SENTRY_DSN,
  },
}

export default withSentryConfig(nextConfig, {
  silent: true,
})
