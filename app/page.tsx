import Link from "next/link";

const courses = [
  {
    slug: "civil_war",
    title: "Civil War: 1820–1865",
    subtitle: "West Point Drama",
    description: "A character-driven narrative history course on the personal relationships between Civil War generals forged at West Point.",
    lessons: 13,
    color: "from-amber-500 to-orange-600",
    icon: "⚔",
    badge: "History",
  },
  {
    slug: "vowel-teams",
    title: "Vowel Teams",
    subtitle: "Phonics for Ages 9–11",
    description: "Systematic, explicit instruction on vowel teams. UFLI-aligned. Multi-sensory and game-like activities for developing readers.",
    lessons: 15,
    color: "from-blue-500 to-indigo-600",
    icon: "🔤",
    badge: "Literacy",
  },
  {
    slug: "green-advantage",
    title: "The Green Advantage",
    subtitle: "Business, Networking & Golf",
    description: "Master the unwritten rules, etiquette, and networking power of golf — the game where deals are made and careers are advanced.",
    lessons: 10,
    color: "from-emerald-500 to-teal-600",
    icon: "🏌️",
    badge: "Business",
  },
  {
    slug: "power-table",
    title: "The Power Table",
    subtitle: "Business Dining & Etiquette",
    description: "Master the etiquette, strategy, and relationship-building power of the business meal — from wine selection to seating politics.",
    lessons: 10,
    color: "from-rose-500 to-pink-600",
    icon: "🍽",
    badge: "Business",
  },
  {
    slug: "inner-circle",
    title: "The Inner Circle",
    subtitle: "Private Clubs & Networks",
    description: "Understand the power of private membership clubs — deal flow on leather sofas, unwritten rules of admission, reciprocity, and belonging.",
    lessons: 10,
    color: "from-violet-500 to-purple-600",
    icon: "🏛",
    badge: "Business",
  },
  {
    slug: "offsite-advantage",
    title: "The Off-Site Advantage",
    subtitle: "Conferences & Events",
    description: "Master the hidden economy of conferences — the real business that happens between sessions in hallways, bars, and after-parties.",
    lessons: 10,
    color: "from-sky-500 to-cyan-600",
    icon: "🎤",
    badge: "Business",
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-lms-text-secondary mt-1 text-sm">Welcome back. Continue where you left off.</p>
      </div>

      {/* Stats row */}
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

      {/* My Courses */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Courses</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {courses.map((course) => (
            <Link
              key={course.slug}
              href={`/courses/${course.slug}`}
              className="lms-card overflow-hidden no-underline hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Course header gradient */}
              <div className={`h-32 bg-gradient-to-br ${course.color} p-5 flex items-end`}>
                <div>
                  <span className="inline-block lms-badge bg-white/20 text-white text-xs mb-2 backdrop-blur-sm">
                    {course.badge}
                  </span>
                  <h3 className="text-white text-lg font-bold leading-tight">{course.title}</h3>
                  <p className="text-white/80 text-xs mt-0.5">{course.subtitle}</p>
                </div>
              </div>
              {/* Course body */}
              <div className="p-5 space-y-3">
                <p className="text-sm text-lms-text-secondary leading-relaxed line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-lms-text-secondary">{course.lessons} modules</span>
                  <span className="text-lms-accent text-xs font-medium hover:underline">View Course →</span>
                </div>
                <div className="lms-progress">
                  <div className="lms-progress-fill" style={{ width: "0%" }} />
                </div>
                <p className="text-xs text-lms-text-muted">0% complete</p>
              </div>
            </Link>
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
