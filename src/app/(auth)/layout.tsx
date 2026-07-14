import Link from "next/link"

/**
 * Layout for the authentication pages (login, signup, forgot-password).
 * Centers a single card on the screen with the ONSET wordmark above it.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-muted/40 flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <Link href="/" className="text-2xl font-bold tracking-tight">
        ONSET
      </Link>
      {children}
    </main>
  )
}
