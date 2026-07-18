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

// The service worker is built by the Serwist CLI in configurator mode (see
// serwist.config.mjs), not by a bundler plugin: @serwist/next's webpack plugin
// is a no-op under Turbopack, which Next 16 uses for builds.
export default withSentryConfig(nextConfig, {
  silent: true,
})
