import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teach — Course Platform",
  description: "Interactive courses built with evidence-based pedagogy",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border bg-white">
          <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6 text-sm">
            <Link href="/" className="font-heading text-lg font-bold text-text no-underline hover:text-accent">
              Teach
            </Link>
            <div className="flex gap-4 ml-auto">
              <Link href="/courses/civil-war" className="text-text-muted hover:text-text transition-colors no-underline">
                Civil War
              </Link>
              <Link href="/courses/vowel-teams" className="text-text-muted hover:text-text transition-colors no-underline">
                Vowel Teams
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-border bg-white py-6 text-center text-xs text-text-muted">
          <p>Courses built with the Teach skill — IRT-based assessments, CTW-inspired design.</p>
          <p className="mt-1">Photos provided by <a href="https://www.pexels.com" className="text-text-muted hover:text-text">Pexels</a></p>
        </footer>
      </body>
    </html>
  );
}
