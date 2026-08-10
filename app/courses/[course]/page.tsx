import { notFound } from "next/navigation";
import Link from "next/link";
import { getCourseMeta } from "@/lib/courses/loader";

export async function generateStaticParams() {
  return [];
}

export default async function CoursePage({ params }: { params: Promise<{ course: string }> }) {
  const { course } = await params;
  let meta;
  try { meta = getCourseMeta(course); } catch { notFound(); }

  const moduleCount = meta.lessons.length;
  const completed = meta.lessons.filter((l) => l.number === 0).length;
  const progress = moduleCount > 0 ? Math.round((completed / moduleCount) * 100) : 0;

  const courseTheme = course === "civil_war"
    ? { gradient: "from-amber-500 to-orange-600", accent: "bg-amber-50 border-amber-200", badge: "bg-amber-100 text-amber-800" }
    : { gradient: "from-blue-500 to-indigo-600", accent: "bg-blue-50 border-blue-200", badge: "bg-blue-100 text-blue-800" };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-lms-text-muted">
        <Link href="/" className="hover:text-lms-accent no-underline">Dashboard</Link>
        <span>/</span>
        <span className="text-lms-text font-medium">{meta.title}</span>
      </nav>

      {/* Course header */}
      <div className={`rounded-xl bg-gradient-to-br ${courseTheme.gradient} p-6 md:p-8 text-white`}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shrink-0">
            {course === "civil_war" ? "⚔" : "🔤"}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold">{meta.title}</h1>
            <p className="text-white/80 text-sm mt-1 max-w-2xl">{meta.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-white/70">
              <span>{moduleCount} modules</span>
              <span>•</span>
              <span>{meta.hasAssessment ? "IRT assessments" : "Self-paced"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress overview */}
      <div className="lms-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Course Progress</h2>
          <span className="text-sm font-medium text-lms-accent">{progress}%</span>
        </div>
        <div className="lms-progress">
          <div className="lms-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-lms-text-muted">
          <span>{completed} of {moduleCount} modules completed</span>
        </div>
      </div>

      {/* Module list */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Course Content</h2>
        <div className="space-y-2">
          {meta.lessons.map((lesson, idx) => {
            const isComplete = false;
            return (
              <Link
                key={lesson.slug}
                href={`/courses/${course}/lessons/${lesson.slug}`}
                className={`lms-card flex items-center gap-4 p-4 no-underline hover:-translate-y-0.5 transition-all duration-200 ${isComplete ? "border-lms-success/30" : ""}`}
              >
                {/* Module number */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-sm font-semibold ${
                  isComplete ? "bg-lms-success-light text-lms-success" : "bg-lms-bg text-lms-text-secondary"
                }`}>
                  {isComplete ? "✓" : String(idx + 1).padStart(2, "0")}
                </div>
                {/* Module info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-lms-text">{lesson.title}</h3>
                  {isComplete && (
                    <p className="text-xs text-lms-success mt-0.5">Completed</p>
                  )}
                </div>
                {/* Status */}
                <span className="text-xs text-lms-text-muted shrink-0">
                  {lesson.number === 0 ? "Overview" : `Module ${lesson.number}`}
                </span>
                <svg className="w-4 h-4 text-lms-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Reference materials */}
      <section className="lms-card p-5">
        <h2 className="text-base font-semibold mb-3">Reference Materials</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { href: `/courses/${course}/reference/glossary.html`, label: "Glossary", icon: "📖" },
            { href: `/courses/${course}/reference/self-test-final.html`, label: "Final Self-Test", icon: "📝" },
            { href: `/courses/${course}/reference/self-test-modules-1-3.html`, label: "Mid-Course Test", icon: "📋" },
          ].map((ref) => (
            <a
              key={ref.href}
              href={ref.href}
              className="flex items-center gap-3 p-3 rounded-lg border border-lms-border hover:border-lms-accent hover:bg-lms-accent-light transition-colors no-underline"
            >
              <span className="text-lg">{ref.icon}</span>
              <span className="text-sm text-lms-text font-medium">{ref.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Assessments */}
      {meta.hasAssessment && (
        <section className={`rounded-xl border p-5 ${courseTheme.accent}`}>
          <h2 className="text-base font-semibold mb-2">Adaptive Assessments</h2>
          <p className="text-sm text-lms-text-secondary mb-3">
            Each module includes an IRT-calibrated adaptive quiz. Questions adapt to your ability level using Item Response Theory.
          </p>
          <span className="lms-badge lms-badge-info">Powered by IRT (3PL Model)</span>
        </section>
      )}
    </div>
  );
}
