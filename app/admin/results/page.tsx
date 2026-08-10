import Link from "next/link";

export default async function ResultsPage() {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  let summary: any[] = [];
  let recent: any[] = [];
  let itemStats: any[] = [];

  try {
    const res = await fetch(`${base}/api/admin/results`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      summary = data.summary || [];
      recent = data.recent || [];
      itemStats = data.itemStats || [];
    }
  } catch {}

  const totalSessions = summary.reduce((s: number, r: any) => s + Number(r.total_sessions || 0), 0);
  const completedSessions = summary.reduce((s: number, r: any) => s + Number(r.completed_sessions || 0), 0);
  const uniqueStudents = summary.reduce((s: number, r: any) => s + Number(r.unique_students || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quiz Results</h1>
          <p className="text-sm text-lms-text-secondary mt-1">IRT assessment performance across all courses.</p>
        </div>
        <Link href="/admin" className="lms-btn lms-btn-outline text-sm">← Back</Link>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="lms-card p-4 text-center">
          <p className="text-2xl font-bold text-lms-accent">{totalSessions}</p>
          <p className="text-xs text-lms-text-muted mt-1">Total Quiz Sessions</p>
        </div>
        <div className="lms-card p-4 text-center">
          <p className="text-2xl font-bold text-lms-success">{completedSessions}</p>
          <p className="text-xs text-lms-text-muted mt-1">Completed</p>
        </div>
        <div className="lms-card p-4 text-center">
          <p className="text-2xl font-bold text-lms-warning">{totalSessions - completedSessions}</p>
          <p className="text-xs text-lms-text-muted mt-1">In Progress</p>
        </div>
        <div className="lms-card p-4 text-center">
          <p className="text-2xl font-bold text-lms-text-secondary">{uniqueStudents}</p>
          <p className="text-xs text-lms-text-muted mt-1">Unique Students</p>
        </div>
      </div>

      {/* Per-course breakdown */}
      <div className="lms-card overflow-hidden">
        <h2 className="text-base font-semibold p-4 pb-0">Course Breakdown</h2>
        <table className="w-full text-sm mt-3">
          <thead>
            <tr className="border-b border-lms-border bg-lms-bg">
              <th className="text-left p-3 font-medium text-lms-text-secondary">Course</th>
              <th className="text-left p-3 font-medium text-lms-text-secondary">Sessions</th>
              <th className="text-left p-3 font-medium text-lms-text-secondary hidden sm:table-cell">Students</th>
              <th className="text-left p-3 font-medium text-lms-text-secondary hidden md:table-cell">Avg Theta</th>
              <th className="text-left p-3 font-medium text-lms-text-secondary hidden md:table-cell">Avg SE</th>
              <th className="text-left p-3 font-medium text-lms-text-secondary">Completed</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((row: any, i: number) => (
              <tr key={i} className="border-b border-lms-border hover:bg-lms-bg/50">
                <td className="p-3 font-medium">{row.course_slug}</td>
                <td className="p-3">{row.total_sessions}</td>
                <td className="p-3 hidden sm:table-cell">{row.unique_students}</td>
                <td className="p-3 hidden md:table-cell">{Number(row.avg_theta || 0).toFixed(2)}</td>
                <td className="p-3 hidden md:table-cell">{Number(row.avg_se || 0).toFixed(2)}</td>
                <td className="p-3">{row.completed_sessions}/{row.total_sessions}</td>
              </tr>
            ))}
            {summary.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-lms-text-muted">No quiz data yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Item performance */}
      <div className="lms-card p-5">
        <h2 className="text-base font-semibold mb-3">Item Performance</h2>
        {itemStats.length > 0 ? (
          <div className="space-y-2">
            {itemStats.slice(0, 20).map((item: any, i: number) => {
              const pct = item.total_responses > 0 ? ((item.correct_count / item.total_responses) * 100).toFixed(0) : "—";
              return (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-16 text-xs text-lms-text-muted font-mono truncate">{item.item_id}</span>
                  <div className="flex-1 h-5 bg-lms-border rounded-full overflow-hidden">
                    <div className="h-full bg-lms-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-16 text-right text-xs text-lms-text-muted">{pct}%</span>
                  <span className="w-12 text-right text-xs text-lms-text-muted">{item.total_responses} resp</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-lms-text-muted text-center py-4">No item response data yet.</p>
        )}
      </div>
    </div>
  );
}
