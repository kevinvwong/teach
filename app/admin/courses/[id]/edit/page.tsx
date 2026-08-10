"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const ARCHETYPES = [
  { value: "history", label: "History / Narrative" },
  { value: "phonics", label: "Phonics / Literacy" },
  { value: "math", label: "Math / Problem-Solving" },
  { value: "custom", label: "Custom / Freeform" },
];

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/courses/${params.id}`)
      .then((r) => r.json())
      .then((data) => { setCourse(data); setModules(data.modules || []); setLoading(false); });
  }, [params.id]);

  const updateCourse = async (field: string, value: any) => {
    const updated = { ...course, [field]: value };
    setCourse(updated);
    setSaving(true);
    await fetch(`/api/admin/courses/${params.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    setSaving(false);
  };

  const addModule = async () => {
    const res = await fetch("/api/admin/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: params.id, number: modules.length, title: `Module ${modules.length}`, status: "draft" }),
    });
    if (res.ok) {
      const mod = await res.json();
      setModules([...modules, mod]);
    }
  };

  const deleteModule = async (id: string) => {
    await fetch(`/api/admin/modules/${id}`, { method: "DELETE" });
    setModules(modules.filter((m) => m.id !== id));
  };

  if (loading) return <div className="text-center py-12 text-lms-text-muted">Loading...</div>;
  if (!course) return <div className="text-center py-12 text-lms-text-muted">Course not found</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-lms-text-secondary hover:text-lms-text no-underline">&larr; Back to courses</Link>
          <h1 className="text-2xl font-bold mt-1">{course.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={`lms-badge ${course.status === "published" ? "lms-badge-success" : "lms-badge-warning"}`}>
            {course.status}
          </span>
          {saving && <span className="text-xs text-lms-text-muted">Saving...</span>}
        </div>
      </div>

      {/* Metadata */}
      <div className="lms-card p-5 space-y-4">
        <h2 className="text-base font-semibold">Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-lms-text mb-1">Title</label>
            <input className="lms-input" value={course.title} onChange={(e) => updateCourse("title", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-lms-text mb-1">Slug</label>
            <input className="lms-input font-mono text-sm" value={course.slug} onChange={(e) => updateCourse("slug", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-lms-text mb-1">Subtitle</label>
            <input className="lms-input" value={course.subtitle || ""} onChange={(e) => updateCourse("subtitle", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-lms-text mb-1">Icon</label>
            <input className="lms-input" value={course.icon || "📚"} onChange={(e) => updateCourse("icon", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-lms-text mb-1">Badge</label>
            <input className="lms-input" value={course.badge || ""} onChange={(e) => updateCourse("badge", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-lms-text mb-1">Status</label>
            <select className="lms-input" value={course.status} onChange={(e) => updateCourse("status", e.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-lms-text mb-1">Archetype</label>
          <select className="lms-input" value={course.archetype || "custom"} onChange={(e) => updateCourse("archetype", e.target.value)}>
            {ARCHETYPES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-lms-text mb-1">Description</label>
          <textarea className="lms-input min-h-[80px]" value={course.description || ""} onChange={(e) => updateCourse("description", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-lms-text mb-1">Mission</label>
          <textarea className="lms-input min-h-[100px] font-mono text-xs" value={course.mission || ""} onChange={(e) => updateCourse("mission", e.target.value)} placeholder="# Why\n# Success looks like\n# Constraints" />
        </div>
      </div>

      {/* Modules */}
      <div className="lms-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Modules ({modules.length})</h2>
          <button onClick={addModule} className="lms-btn lms-btn-primary text-sm !px-3 !py-1.5">+ Add Module</button>
        </div>

        <div className="space-y-2">
          {modules
            .sort((a: any, b: any) => a.number - b.number)
            .map((mod: any, idx: number) => (
              <div key={mod.id} className="flex items-center gap-3 p-3 rounded-lg border border-lms-border hover:border-lms-accent/50 transition-colors">
                <span className="w-8 h-8 rounded-lg bg-lms-bg flex items-center justify-center text-xs font-semibold text-lms-text-secondary shrink-0">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <Link href={`/admin/courses/${params.id}/modules/${mod.id}/edit`} className="font-medium text-sm text-lms-text hover:text-lms-accent no-underline">
                    {mod.title}
                  </Link>
                  {mod.description && <p className="text-xs text-lms-text-muted mt-0.5 truncate">{mod.description}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`lms-badge text-[10px] ${mod.status === "published" ? "lms-badge-success" : "lms-badge-warning"}`}>
                    {mod.status}
                  </span>
                  <Link href={`/admin/courses/${params.id}/modules/${mod.id}/edit`} className="text-xs text-lms-accent hover:underline">Edit</Link>
                  <button onClick={() => deleteModule(mod.id)} className="text-xs text-lms-error hover:underline">Delete</button>
                </div>
              </div>
            ))}
          {modules.length === 0 && (
            <p className="text-center py-8 text-lms-text-muted text-sm">No modules yet. Add your first module.</p>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="lms-card p-5 border-lms-error/30">
        <h2 className="text-base font-semibold text-lms-error mb-2">Danger Zone</h2>
        <p className="text-sm text-lms-text-secondary mb-3">Deleting this course will permanently remove all modules and content. This cannot be undone.</p>
        <button onClick={async () => {
          if (confirm("Delete this course permanently?")) {
            await fetch(`/api/admin/courses/${params.id}`, { method: "DELETE" });
            router.push("/admin");
          }
        }} className="lms-btn bg-lms-error text-white hover:bg-red-700">Delete Course</button>
      </div>
    </div>
  );
}
