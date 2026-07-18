// @ts-check
import { serwist } from "@serwist/next/config"

/**
 * Serwist configurator mode: `serwist build` runs after `next build` (see the
 * build script), compiles src/sw.ts with esbuild, and injects the precache
 * manifest — including every prerendered route, such as the /offline fallback.
 * Bundler-agnostic, so it works with Next 16's Turbopack builds.
 */
export default serwist({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
})
