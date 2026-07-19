import { MobileNav } from "@/components/layout/mobile-nav"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { InstallBanner } from "@/components/shared/install-banner"

/**
 * Shell for all authenticated app pages: persistent sidebar (desktop),
 * a topbar with the page title, and a bottom tab bar (mobile). The session and
 * role are enforced upstream by the proxy middleware; pages may additionally
 * wrap sensitive content in <RoleGuard>.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">{children}</main>
      </div>
      <MobileNav />
      {/* Mounted in the app shell (not the root layout) so only signed-in,
          engaged users get the install prompt — not first-time visitors. */}
      <InstallBanner />
    </div>
  )
}
