import Link from "next/link";

const series = [
  {
    title: "Second Business Spaces",
    subtitle: "4 Courses · 40 Modules",
    description: "Master the hidden language of business across the spaces where deals are really made — the golf course, the dining table, the private club, and the conference floor.",
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
    courses: [
      { slug: "green-advantage", title: "The Green Advantage", icon: "🏌️", subtitle: "Golf & Networking", lessons: 10, color: "from-emerald-500 to-teal-600" },
      { slug: "power-table", title: "The Power Table", icon: "🍽", subtitle: "Dining & Etiquette", lessons: 10, color: "from-rose-500 to-pink-600" },
      { slug: "inner-circle", title: "The Inner Circle", icon: "🏛", subtitle: "Private Clubs", lessons: 10, color: "from-violet-500 to-purple-600" },
      { slug: "offsite-advantage", title: "The Off-Site Advantage", icon: "🎤", subtitle: "Conferences & Events", lessons: 10, color: "from-sky-500 to-cyan-600" },
    ],
  },
];

const standalone = [
  { slug: "civil_war", title: "Civil War: 1820–1865", subtitle: "West Point Drama", icon: "⚔", lessons: 13, color: "from-amber-500 to-orange-600", badge: "History" },
  { slug: "vowel-teams", title: "Vowel Teams", subtitle: "Phonics for Ages 9–11", icon: "🔤", lessons: 15, color: "from-blue-500 to-indigo-600", badge: "Literacy" },
];

function CourseCard({ course, baseSlug }: { course: any; baseSlug?: string }) {
  const href = baseSlug ? `/courses/${baseSlug}` : `/courses/${course.slug}`;
  const imgPath = `/course-images/${course.slug}.jpg`;
  return (
    <Link href={href} className="lms-card overflow-hidden no-underline hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="h-32 relative overflow-hidden">
        <img src={imgPath} alt={course.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className={`absolute inset-0 bg-gradient-to-t ${course.color} opacity-80`} />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {course.badge && <span className="inline-block lms-badge bg-white/20 text-white text-[10px] mb-1.5 backdrop-blur-sm">{course.badge}</span>}
          <h3 className="text-white text-base font-bold leading-tight">{course.title}</h3>
          <p className="text-white/70 text-[11px] mt-0.5">{course.subtitle}</p>
        </div>
      </div>
      <div className="p-4 space-y-2.5">
        <p className="text-xs text-lms-text-muted">{course.lessons} modules</p>
        <div className="lms-progress"><div className="lms-progress-fill" style={{ width: "0%" }} /></div>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-lms-text-secondary mt-1 text-sm">Welcome back. Continue where you left off.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Enrolled Courses", value: "6", color: "text-lms-accent" },
          { label: "Total Modules", value: "68", color: "text-lms-success" },
          { label: "Completed", value: "0", color: "text-lms-warning" },
          { label: "Quiz Attempts", value: "0", color: "text-lms-text-secondary" },
        ].map((stat) => (
          <div key={stat.label} className="lms-card p-4">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-lms-text-secondary mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Series Banner */}
      {series.map((s) => (
        <section key={s.title} className="rounded-xl overflow-hidden">
          <div className={`bg-gradient-to-br ${s.gradient} p-5 md:p-6 text-white`}>
            <h2 className="text-lg font-bold">{s.title}</h2>
            <p className="text-white/80 text-sm mt-1">{s.subtitle}</p>
            <p className="text-white/60 text-xs mt-2 max-w-2xl">{s.description}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white border-x border-b border-lms-border rounded-b-xl">
            {s.courses.map((course) => (
              <CourseCard key={course.slug} course={course} baseSlug={course.slug} />
            ))}
          </div>
        </section>
      ))}

      {/* Standalone Courses */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Other Courses</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {standalone.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </section>

      {/* Activity */}
      <section className="lms-card p-5">
        <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
        <div className="text-center py-8 text-lms-text-muted">
          <p className="text-3xl mb-2">📚</p>
          <p className="text-sm">No activity yet. Start a lesson to track your progress.</p>
        </div>
      </section>
    </div>
  );
}
