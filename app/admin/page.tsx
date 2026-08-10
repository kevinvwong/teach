import Link from "next/link";

export default async function AdminPage() {
  let courses: any[] = [];
  try {
    const base = process.env.VERCEL_ENV
      ? `https://${process.env.VERCEL_URL || "teach-app-kappa.vercel.app"}`
      : "http://localhost:3000";
    const res = await fetch(`${base}/api/admin/courses`, { cache: "no-store" });
    if (res.ok) courses = await res.json();
  } catch {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Course Management</h1>
          <p className="text-sm text-lms-text-secondary mt-1">Create, edit, and manage your courses.</p>
        </div>
        <Link href="/admin/courses/new" className="lms-btn lms-btn-primary">
          + New Course
        </Link>
      </div>

      {/* Workflow overview */}
      {(() => {
        const phases = [
          { id: "foundation", icon: "🎯", label: "Foundation", count: courses.filter((c:any) => (c.workflowPhase||"foundation") === "foundation").length },
          { id: "content", icon: "✍️", label: "Content", count: courses.filter((c:any) => c.workflowPhase === "content").length },
          { id: "assessment", icon: "📊", label: "Assessment", count: courses.filter((c:any) => c.workflowPhase === "assessment").length },
          { id: "review", icon: "🔍", label: "Review", count: courses.filter((c:any) => c.workflowPhase === "review").length },
          { id: "publish", icon: "🚀", label: "Publish", count: courses.filter((c:any) => c.workflowPhase === "publish").length },
        ];
        const maxCount = Math.max(...phases.map(p => p.count), 1);
        return (
        <div className="grid grid-cols-5 gap-2">
          {phases.map((p) => (
            <div key={p.id} className="lms-card p-3 text-center">
              <p className="text-lg mb-0.5">{p.icon}</p>
              <p className="text-lg font-bold text-lms-text">{p.count}</p>
              <p className="text-[10px] text-lms-text-muted">{p.label}</p>
              <div className="lms-progress mt-1.5">
                <div className="lms-progress-fill" style={{ width: `${(p.count / maxCount) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        );
      })()}

      <div className="lms-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-lms-border bg-lms-bg">
              <th className="text-left p-3 font-medium text-lms-text-secondary">Course</th>
              <th className="text-left p-3 font-medium text-lms-text-secondary hidden md:table-cell">Archetype</th>
              <th className="text-left p-3 font-medium text-lms-text-secondary hidden sm:table-cell">Status</th>
              <th className="text-left p-3 font-medium text-lms-text-secondary">Workflow</th>
              <th className="text-right p-3 font-medium text-lms-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c: any) => {
              const phase = c.workflowPhase || "foundation";
              const phaseIcons: Record<string, string> = { foundation: "🎯", content: "✍️", assessment: "📊", review: "🔍", publish: "🚀" };
              const phaseColors: Record<string, string> = { foundation: "text-gray-500", content: "text-blue-500", assessment: "text-violet-500", review: "text-amber-500", publish: "text-green-500" };
              return (
              <tr key={c.id} className="border-b border-lms-border hover:bg-lms-bg/50 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{c.icon || "📚"}</span>
                    <div>
                      <Link href={`/admin/courses/${c.id}/edit`} className="font-medium text-lms-text hover:text-lms-accent no-underline">
                        {c.title}
                      </Link>
                      <p className="text-xs text-lms-text-muted mt-0.5">{c.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-lms-text-secondary hidden md:table-cell text-xs">{c.archetype || "custom"}</td>
                <td className="p-3 hidden sm:table-cell">
                  <span className={`lms-badge ${c.status === "published" ? "lms-badge-success" : "lms-badge-warning"}`}>
                    {c.status}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${phaseColors[phase] || "text-gray-500"}`}>
                    <span>{phaseIcons[phase] || "📋"}</span>
                    <span className="capitalize">{phase}</span>
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/courses/${c.id}/edit`} className="lms-btn lms-btn-outline text-xs !px-3 !py-1.5">
                      Edit
                    </Link>
                    <Link href={`/courses/${c.slug}`} className="lms-btn lms-btn-outline text-xs !px-3 !py-1.5">
                      View
                    </Link>
                  </div>
                </td>
              </tr>
              );
            })}
            {courses.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-lms-text-muted">
                  <p className="text-2xl mb-2">📚</p>
                  <p>No courses yet. Create your first course to get started.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="lms-card p-5">
        <h2 className="text-base font-semibold mb-2">Quick Start</h2>
        <p className="text-sm text-lms-text-secondary mb-4">New to creating courses? The guided wizard will scaffold your course structure based on your chosen archetype.</p>
        <Link href="/admin/courses/new" className="lms-btn lms-btn-primary">Create a Course</Link>
      </div>
    </div>
  );
}
