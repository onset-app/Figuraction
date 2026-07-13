import * as Sentry from "@sentry/nextjs"

// Turbopack (default in Next.js 16) does not support sentry.client.config.ts —
// this file is the supported replacement. See:
// https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
