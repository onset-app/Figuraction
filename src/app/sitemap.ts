import type { MetadataRoute } from "next"
import { getPublicCastings } from "@/actions/castings"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

/**
 * Sitemap for the public site: static SEO pages plus one entry per open
 * casting. Served at /sitemap.xml, regenerated on demand (dynamic route) so
 * newly opened castings appear without a redeploy.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${APP_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${APP_URL}/castings`, changeFrequency: "daily", priority: 0.9 },
    { url: `${APP_URL}/devenir-figurant`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${APP_URL}/pour-les-productions`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${APP_URL}/mentions-legales`, changeFrequency: "yearly", priority: 0.1 },
  ]

  const castings = await getPublicCastings()
  const castingRoutes: MetadataRoute.Sitemap = castings.map((casting) => ({
    url: `${APP_URL}/castings/${casting.id}`,
    lastModified: casting.updatedAt,
    changeFrequency: "daily",
    priority: 0.7,
  }))

  return [...staticRoutes, ...castingRoutes]
}
