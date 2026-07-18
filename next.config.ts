import { withSentryConfig } from "@sentry/nextjs"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // SENTRY_DSN is not a secret (it only identifies the ingest endpoint), so it's
  // safe to inline into the client bundle without a NEXT_PUBLIC_ prefix — this
  // keeps a single env var name shared by client, server, and edge configs.
  env: {
    SENTRY_DSN: process.env.SENTRY_DSN,
  },
  experimental: {
    serverActions: {
      // Photo uploads travel through a server action; Next's default cap is
      // 1 MB, which would reject 1–5 MB phone photos before uploadPhoto's own
      // 5 MB validation ever runs. Slightly above 5 MB so the app-level check
      // (with its French error message) stays the authority.
      bodySizeLimit: "6mb",
    },
  },
}

// The service worker is built by the Serwist CLI in configurator mode (see
// serwist.config.mjs), not by a bundler plugin: @serwist/next's webpack plugin
// is a no-op under Turbopack, which Next 16 uses for builds.
export default withSentryConfig(nextConfig, {
  silent: true,
})
