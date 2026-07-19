import { SerwistProvider } from "@serwist/next/react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { PostHogProvider } from "@/components/providers/posthog-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "ONSET — Casting figurants en Belgique",
    template: "%s | ONSET",
  },
  description:
    "ONSET — la plateforme qui connecte les productions audiovisuelles et les figurants en Belgique.",
  applicationName: "ONSET",
  openGraph: {
    siteName: "ONSET",
    locale: "fr_BE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Registers /sw.js (built by `serwist build`); disabled in dev where
            the service worker isn't generated and would poison hot reloads. */}
        <SerwistProvider swUrl="/sw.js" disable={process.env.NODE_ENV !== "production"}>
          <PostHogProvider>
            <QueryProvider>{children}</QueryProvider>
          </PostHogProvider>
        </SerwistProvider>
        <Toaster />
      </body>
    </html>
  )
}
