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

  return (
    <div>
      <Link href="/" className="text-sm text-text-muted hover:text-text no-underline">&larr; All courses</Link>

      <section className="mt-4 mb-8">
        <h1 className="text-3xl font-heading font-bold">{meta.title}</h1>
        {meta.description && (
          <p className="text-text-muted mt-2 max-w-2xl">{meta.description}</p>
        )}
        <p className="text-xs text-text-muted mt-2">{meta.lessons.length} modules</p>
      </section>

      <section>
        <h2 className="text-lg font-heading font-semibold mb-4 border-b border-border pb-2">Modules</h2>
        <ol className="space-y-2">
          {meta.lessons.map((lesson) => (
            <li key={lesson.slug}>
              <Link
                href={`/courses/${course}/lessons/${lesson.slug}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-accent hover:bg-surface-hover no-underline transition-all"
              >
                <span className="text-xs font-mono text-text-muted w-10 shrink-0">
                  {String(lesson.number).padStart(2, "0")}
                </span>
                <span className="font-medium text-text">{lesson.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {meta.hasAssessment && (
        <section className="mt-8 p-4 rounded-lg bg-surface-info border border-blue-200">
          <h2 className="text-sm font-semibold text-text mb-1">Adaptive Assessments</h2>
          <p className="text-xs text-text-muted">
            This course includes IRT-calibrated adaptive quizzes. Each module has a check-your-understanding quiz powered by Item Response Theory.
          </p>
        </section>
      )}
    </div>
  );
}
