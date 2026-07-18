import type { Metadata } from "next"
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <PostHogProvider>
          <QueryProvider>{children}</QueryProvider>
        </PostHogProvider>
        <Toaster />
      </body>
    </html>
  )
}
