import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teach LMS",
  description: "Evidence-based interactive courses with IRT-adaptive assessments",
};

const navItems = [
  { href: "/", label: "Dashboard", icon: "□" },
  { href: "/courses/green-advantage", label: "Green Advantage", icon: "🏌️" },
  { href: "/courses/power-table", label: "Power Table", icon: "🍽" },
  { href: "/courses/inner-circle", label: "Inner Circle", icon: "🏛" },
  { href: "/courses/offsite-advantage", label: "Off-Site Advantage", icon: "🎤" },
  { href: "/courses/civil_war", label: "Civil War", icon: "⚔" },
  { href: "/courses/vowel-teams", label: "Vowel Teams", icon: "🔤" },
  { href: "/admin", label: "Course Manager", icon: "⚙" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex">
        {/* Sidebar */}
        <aside className="w-64 bg-lms-sidebar text-white flex flex-col shrink-0 max-md:hidden">
          <div className="px-6 py-5 border-b border-white/10">
            <Link href="/" className="flex items-center gap-3 no-underline">
              <div className="w-8 h-8 rounded-lg bg-lms-accent flex items-center justify-center text-sm font-bold">
                T
              </div>
              <span className="font-semibold text-base text-white">Teach LMS</span>
            </Link>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-lms-sidebar-hover transition-colors no-underline"
              >
                <span className="w-5 text-center text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="w-8 h-8 rounded-full bg-lms-accent-light text-lms-accent flex items-center justify-center text-xs font-bold">
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
            <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-lms-border p-2 space-y-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-lms-text hover:bg-lms-bg no-underline transition-colors">
                  <span className="w-5 text-center">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
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
