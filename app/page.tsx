import Link from "next/link";

const courses = [
  {
    slug: "civil-war",
    title: "Civil War: 1820–1865",
    subtitle: "West Point Drama",
    description: "A character-driven narrative history course on the personal relationships between Civil War generals forged at West Point. Jeopardy-ready.",
    lessons: 13,
    color: "bg-amber-50 border-amber-300",
    accent: "text-amber-700",
  },
  {
    slug: "vowel-teams",
    title: "Vowel Teams",
    subtitle: "Phonics for Ages 9–11",
    description: "Systematic, explicit instruction on vowel teams (ai, ay, ee, ea, igh, oa, oe, ue, ui, oi, oy, ou, ow, au, aw, oo). UFLI-aligned. Multi-sensory and game-like.",
    lessons: 15,
    color: "bg-blue-50 border-blue-300",
    accent: "text-blue-700",
  },
];

export default function Home() {
  return (
    <div>
      <section className="text-center py-12">
        <h1 className="text-4xl font-heading font-bold mb-3">Teach</h1>
        <p className="text-lg text-text-muted max-w-xl mx-auto">
          Evidence-based interactive courses. IRT-adaptive assessments, child-centered design, and beautiful lessons.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-6 mt-8">
        {courses.map((course) => (
          <Link
            key={course.slug}
            href={`/courses/${course.slug}`}
            className={`block rounded-xl border-2 ${course.color} p-6 no-underline transition-all hover:shadow-md hover:-translate-y-0.5`}
          >
            <h2 className={`text-xl font-heading font-bold ${course.accent} mb-1`}>{course.title}</h2>
            <p className="text-sm text-text-muted font-medium mb-3">{course.subtitle}</p>
            <p className="text-text text-sm leading-relaxed">{course.description}</p>
            <p className="mt-4 text-xs text-text-muted">{course.lessons} modules</p>
          </Link>
        ))}
      </section>

      <section className="mt-16 border-t border-border pt-8">
        <h2 className="text-lg font-heading font-semibold mb-4">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-6 text-sm text-text-muted">
          <div>
            <h3 className="font-semibold text-text mb-1">1. Study</h3>
            <p>Self-paced lessons with narrative hooks, knowledge injection, and cumulative review.</p>
          </div>
          <div>
            <h3 className="font-semibold text-text mb-1">2. Practice</h3>
            <p>Retrieval practice with spaced repetition. Adaptive quizzes calibrated via Item Response Theory.</p>
          </div>
          <div>
            <h3 className="font-semibold text-text mb-1">3. Track</h3>
            <p>Progress tracked across modules. IRT ability estimates show your growth over time.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
