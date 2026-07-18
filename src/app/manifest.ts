import type { MetadataRoute } from "next"

/**
 * PWA web app manifest, served at /manifest.webmanifest and linked
 * automatically by Next. Icons are ImageResponse routes (see /icon-192,
 * /icon-512) so no binary assets need to be committed.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ONSET — Casting figurants en Belgique",
    short_name: "ONSET",
    description:
      "La plateforme qui connecte les productions audiovisuelles et les figurants en Belgique.",
    id: "/",
    start_url: "/app/dashboard",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    lang: "fr",
    categories: ["entertainment", "business"],
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
