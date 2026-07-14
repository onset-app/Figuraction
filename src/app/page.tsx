import Link from "next/link"

export default function Home() {
  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <span className="text-4xl font-bold tracking-tight sm:text-5xl">ONSET</span>

      <div className="flex items-center gap-3">
        <span className="relative flex size-2.5">
          <span className="bg-primary/60 absolute inline-flex size-full animate-ping rounded-full" />
          <span className="bg-primary relative inline-flex size-2.5 rounded-full" />
        </span>
        <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          Travaux en cours
        </p>
      </div>

      <div className="max-w-md space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Notre plateforme arrive bientôt
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          ONSET connecte les productions audiovisuelles et les figurants en Belgique. Nous
          peaufinons les derniers détails — revenez très vite&nbsp;!
        </p>
      </div>

      <Link
        href="/login"
        className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-4 transition-colors"
      >
        Accéder à mon espace
      </Link>
    </main>
  )
}
