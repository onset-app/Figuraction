import type { MetadataRoute } from "next"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

/** robots.txt: keep crawlers on the public site, out of the app and auth flows. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/app/",
        "/auth/",
        "/login",
        "/signup",
        "/forgot-password",
        "/update-password",
        "/api/",
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
