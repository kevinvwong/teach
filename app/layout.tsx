import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teach LMS",
  description: "Evidence-based interactive courses with IRT-adaptive assessments",
};

const navGroups = [
  {
    label: "Main",
    defaultOpen: true,
    items: [
      { href: "/", label: "Dashboard", icon: "□", subtitle: "" },
    ],
  },
  {
    label: "Business Series",
    defaultOpen: true,
    items: [
      { href: "/courses/green-advantage", label: "The Green Advantage", icon: "🏌️", subtitle: "Golf & Networking" },
      { href: "/courses/power-table", label: "The Power Table", icon: "🍽", subtitle: "Dining & Etiquette" },
      { href: "/courses/inner-circle", label: "The Inner Circle", icon: "🏛", subtitle: "Private Clubs" },
      { href: "/courses/offsite-advantage", label: "The Off-Site Advantage", icon: "🎤", subtitle: "Conferences & Events" },
    ],
  },
  {
    label: "Academic",
    defaultOpen: false,
    items: [
      { href: "/courses/civil_war", label: "Civil War", icon: "⚔", subtitle: "1820–1865" },
      { href: "/courses/vowel-teams", label: "Vowel Teams", icon: "🔤", subtitle: "Phonics Ages 9–11" },
    ],
  },
  {
    label: "System",
    defaultOpen: false,
    items: [
      { href: "/admin", label: "Course Manager", icon: "⚙", subtitle: "" },
    ],
  },
];

function NavGroup({ group }: { group: typeof navGroups[number] }) {
  return (
    <details open={group.defaultOpen} className="group">
      <summary className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 list-none select-none [&::-webkit-details-marker]:hidden">
        <svg className={`w-3 h-3 transition-transform group-open:rotate-90`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {group.label}
      </summary>
      <div className="mt-0.5 space-y-0.5">
        {group.items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-lms-sidebar-hover transition-colors no-underline"
          >
            <span className="w-5 text-center text-base shrink-0">{item.icon}</span>
            <div className="min-w-0">
              <p className="truncate">{item.label}</p>
              {item.subtitle && (
                <p className="text-[10px] text-gray-500 truncate leading-tight">{item.subtitle}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </details>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex">
        {/* Sidebar */}
        <aside className="w-64 bg-lms-sidebar text-white flex flex-col shrink-0 max-md:hidden overflow-y-auto">
          <div className="px-6 py-5 border-b border-white/10 shrink-0">
            <Link href="/" className="flex items-center gap-3 no-underline">
              <div className="w-8 h-8 rounded-lg bg-lms-accent flex items-center justify-center text-sm font-bold shrink-0">
                T
              </div>
              <span className="font-semibold text-base text-white">Teach LMS</span>
            </Link>
          </div>
          <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
            {navGroups.map((group) => (
              <NavGroup key={group.label} group={group} />
            ))}
          </nav>
          <div className="p-4 border-t border-white/10 shrink-0">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="w-8 h-8 rounded-full bg-lms-accent-light text-lms-accent flex items-center justify-center text-xs font-bold shrink-0">
                Y
              </div>
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
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-lms-text-muted px-3 pb-1">Business Series</p>
                {navGroups[1].items.map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-lms-text hover:bg-lms-bg no-underline">
                    <span className="w-5 text-center">{item.icon}</span>
                    <div><p>{item.label}</p><p className="text-[10px] text-lms-text-muted">{item.subtitle}</p></div>
                  </Link>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-lms-text-muted px-3 pb-1">Academic</p>
                {navGroups[2].items.map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-lms-text hover:bg-lms-bg no-underline">
                    <span className="w-5 text-center">{item.icon}</span>{item.label}
                  </Link>
                ))}
              </div>
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
            <div className="max-w-5xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
