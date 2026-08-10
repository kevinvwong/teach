import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teach LMS",
  description: "Evidence-based interactive courses with IRT-adaptive assessments",
};

async function getNavData() {
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const res = await fetch(`${base}/api/nav`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch {}
  return { main: [], businessSeries: [], academic: [], extras: [] };
}

function NavItem({ href, icon, label, subtitle }: { href: string; icon: string; label: string; subtitle?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-lms-sidebar-hover transition-colors no-underline">
      <span className="w-5 text-center text-base shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="truncate">{label}</p>
        {subtitle && <p className="text-[10px] text-gray-500 truncate leading-tight">{subtitle}</p>}
      </div>
    </Link>
  );
}

function NavGroup({ label, defaultOpen, children }: { label: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details open={defaultOpen} className="group">
      <summary className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 list-none select-none [&::-webkit-details-marker]:hidden">
        <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {label}
      </summary>
      <div className="mt-0.5 space-y-0.5">{children}</div>
    </details>
  );
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nav = await getNavData();

  const toItem = (c: any) => ({ href: `/courses/${c.slug}`, icon: c.icon || "📚", label: c.label, subtitle: c.subtitle || "" });

  return (
    <html lang="en" className="h-full">
      <body className="h-full flex">
        {/* Sidebar */}
        <aside className="w-64 bg-lms-sidebar text-white flex flex-col shrink-0 max-md:hidden overflow-y-auto">
          <div className="px-6 py-5 border-b border-white/10 shrink-0">
            <Link href="/" className="flex items-center gap-3 no-underline">
              <div className="w-8 h-8 rounded-lg bg-lms-accent flex items-center justify-center text-sm font-bold shrink-0">T</div>
              <span className="font-semibold text-base text-white">Teach LMS</span>
            </Link>
          </div>
          <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
            <NavGroup label="Main" defaultOpen>
              <NavItem href="/" icon="□" label="Dashboard" />
            </NavGroup>
            {nav.businessSeries?.length > 0 && (
              <NavGroup label="Business Series" defaultOpen>
                {nav.businessSeries.map((c: any) => <NavItem key={c.slug} {...toItem(c)} />)}
              </NavGroup>
            )}
            {nav.academic?.length > 0 && (
              <NavGroup label="Academic">
                {nav.academic.map((c: any) => <NavItem key={c.slug} {...toItem(c)} />)}
              </NavGroup>
            )}
            {nav.extras?.length > 0 && (
              <NavGroup label="More Courses">
                {nav.extras.map((c: any) => <NavItem key={c.slug} {...toItem(c)} />)}
              </NavGroup>
            )}
            <NavGroup label="System">
              <NavItem href="/admin" icon="⚙" label="Course Manager" />
            </NavGroup>
          </nav>
          <div className="p-4 border-t border-white/10 shrink-0">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="w-8 h-8 rounded-full bg-lms-accent-light text-lms-accent flex items-center justify-center text-xs font-bold shrink-0">Y</div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">Student</p>
                <p className="text-xs text-gray-400 truncate">Free Account</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-lms-border px-4 h-14 flex items-center gap-3">
          <details className="group relative">
            <summary className="list-none cursor-pointer p-1 -ml-1 rounded-lg hover:bg-lms-bg">
              <svg className="w-5 h-5 text-lms-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </summary>
            <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-lms-border p-3 space-y-3 max-h-[80vh] overflow-y-auto">
              <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-lms-text hover:bg-lms-bg no-underline font-medium">
                <span className="w-5 text-center">□</span>Dashboard
              </Link>
              {nav.businessSeries?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-lms-text-muted px-3 pb-1">Business Series</p>
                  {nav.businessSeries.map((c: any) => (
                    <Link key={c.slug} href={`/courses/${c.slug}`} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-lms-text hover:bg-lms-bg no-underline">
                      <span className="w-5 text-center">{c.icon}</span>
                      <div><p>{c.label}</p><p className="text-[10px] text-lms-text-muted">{c.subtitle}</p></div>
                    </Link>
                  ))}
                </div>
              )}
              <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-lms-text hover:bg-lms-bg no-underline">
                <span className="w-5 text-center">⚙</span>Course Manager
              </Link>
            </div>
          </details>
          <Link href="/" className="font-semibold text-lms-text no-underline">Teach LMS</Link>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-0 max-md:pt-14">
          <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
            <div className="max-w-5xl mx-auto">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
