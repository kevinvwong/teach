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
  const [fetchingImage, setFetchingImage] = useState(false);
  const [imageSearch, setImageSearch] = useState("");

  useEffect(() => {
    fetch(`/api/admin/courses/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setCourse(data);
        setModules((data.modules || []).sort((a: any, b: any) => a.number - b.number));
        setImageSearch(data.title.split(":")[0].trim());
        setLoading(false);
      });
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

  const reorderModule = async (idx: number, direction: "up" | "down") => {
    const newMods = [...modules];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newMods.length) return;
    [newMods[idx].number, newMods[swapIdx].number] = [newMods[swapIdx].number, newMods[idx].number];
    [newMods[idx], newMods[swapIdx]] = [newMods[swapIdx], newMods[idx]];
    setModules(newMods);
    for (const mod of [newMods[idx], newMods[swapIdx]]) {
      await fetch(`/api/admin/modules/${mod.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: mod.number }),
      });
    }
  };

  const addModule = async () => {
    const maxNum = modules.reduce((max, m) => Math.max(max, m.number), -1);
    const res = await fetch("/api/admin/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: params.id, number: maxNum + 1, title: `Module ${maxNum + 1}`, status: "draft" }),
    });
    if (res.ok) { setModules([...modules, await res.json()]); }
  };

  const deleteModule = async (id: string) => {
    await fetch(`/api/admin/modules/${id}`, { method: "DELETE" });
    setModules(modules.filter((m) => m.id !== id));
  };

  const bulkPublish = async (status: string) => {
    for (const mod of modules) {
      await fetch(`/api/admin/modules/${mod.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    }
    setModules(modules.map((m) => ({ ...m, status })));
  };

  const fetchPexelsImage = async () => {
    if (!imageSearch.trim()) return;
    setFetchingImage(true);
    try {
      const res = await fetch(`/api/admin/courses/${params.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pexelsQuery: imageSearch.trim() }),
      });
      if (res.ok) {
        // Reload course to see the new image
        const reload = await fetch(`/api/admin/courses/${params.id}`);
        setCourse(await reload.json());
        // Trigger image refresh
        const img = new Image();
        img.src = `/course-images/${course.slug}.jpg?t=${Date.now()}`;
      }
    } catch {}
    setFetchingImage(false);
  };

  // IMSCC export: call server endpoint that triggers the export script
  // For now, open a new tab with the export URL
  const exportIMSCC = () => {
    window.open(`/api/admin/export-imscc/${course.slug}`, "_blank");
  };

  if (loading) return <div className="text-center py-12 text-lms-text-muted">Loading...</div>;
  if (!course) return <div className="text-center py-12 text-lms-text-muted">Course not found</div>;

  const publishedCount = modules.filter((m) => m.status === "published").length;
  const hasContent = modules.some((m) => m.lessonHtml);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-lms-text-secondary hover:text-lms-text no-underline">&larr; Back to courses</Link>
          <h1 className="text-2xl font-bold mt-1">{course.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/courses/${course.slug}`} className="lms-btn lms-btn-outline text-sm !px-3 !py-1.5">View Course</Link>
          <span className={`lms-badge ${course.status === "published" ? "lms-badge-success" : "lms-badge-warning"}`}>{course.status}</span>
          {saving && <span className="text-xs text-lms-text-muted">Saving...</span>}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="lms-card p-3 text-center">
          <p className="text-lg font-bold text-lms-accent">{modules.length}</p>
          <p className="text-xs text-lms-text-muted">Modules</p>
        </div>
        <div className="lms-card p-3 text-center">
          <p className="text-lg font-bold text-lms-success">{publishedCount}</p>
          <p className="text-xs text-lms-text-muted">Published</p>
        </div>
        <div className="lms-card p-3 text-center">
          <p className="text-lg font-bold text-lms-warning">{modules.length - publishedCount}</p>
          <p className="text-xs text-lms-text-muted">Drafts</p>
        </div>
        <div className="lms-card p-3 text-center">
          <p className="text-lg font-bold text-lms-text-secondary">{hasContent ? "✓" : "—"}</p>
          <p className="text-xs text-lms-text-muted">Has Content</p>
        </div>
      </div>

      {/* Image + Export row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Course Image */}
        <div className="lms-card p-4">
          <h2 className="text-sm font-semibold mb-2">Course Image</h2>
          <div className="relative h-32 rounded-lg overflow-hidden bg-lms-bg mb-2">
            <img
              src={`/course-images/${course.slug}.jpg?t=${Date.now()}`}
              alt={course.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
          <div className="flex gap-2">
            <input className="lms-input text-sm flex-1" value={imageSearch} onChange={(e) => setImageSearch(e.target.value)}
              placeholder="Search Pexels for image..." />
            <button onClick={fetchPexelsImage} disabled={fetchingImage || !imageSearch.trim()}
              className="lms-btn lms-btn-primary text-sm !px-3 !py-1.5 shrink-0">
              {fetchingImage ? "..." : "Fetch"}
            </button>
          </div>
        </div>

        {/* Export */}
        <div className="lms-card p-4">
          <h2 className="text-sm font-semibold mb-2">Export</h2>
          <p className="text-xs text-lms-text-secondary mb-3">Export this course as an IMS Common Cartridge (.imscc) for import into Canvas, Moodle, or Blackboard.</p>
          <button onClick={exportIMSCC} className="lms-btn lms-btn-primary text-sm">Export IMSCC</button>
        </div>
      </div>

      {/* Settings */}
      <div className="lms-card p-5 space-y-4">
        <h2 className="text-base font-semibold">Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-lms-text mb-1">Title</label>
            <input className="lms-input" value={course.title} onChange={(e) => updateCourse("title", e.target.value)} /></div>
          <div><label className="block text-sm font-medium text-lms-text mb-1">Slug</label>
            <input className="lms-input font-mono text-sm" value={course.slug} onChange={(e) => updateCourse("slug", e.target.value)} /></div>
          <div><label className="block text-sm font-medium text-lms-text mb-1">Subtitle</label>
            <input className="lms-input" value={course.subtitle || ""} onChange={(e) => updateCourse("subtitle", e.target.value)} /></div>
          <div><label className="block text-sm font-medium text-lms-text mb-1">Icon</label>
            <input className="lms-input" value={course.icon || "📚"} onChange={(e) => updateCourse("icon", e.target.value)} /></div>
          <div><label className="block text-sm font-medium text-lms-text mb-1">Badge</label>
            <input className="lms-input" value={course.badge || ""} onChange={(e) => updateCourse("badge", e.target.value)} /></div>
          <div><label className="block text-sm font-medium text-lms-text mb-1">Status</label>
            <select className="lms-input" value={course.status} onChange={(e) => updateCourse("status", e.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select></div>
        </div>
        <div><label className="block text-sm font-medium text-lms-text mb-1">Archetype</label>
          <select className="lms-input" value={course.archetype || "custom"} onChange={(e) => updateCourse("archetype", e.target.value)}>
            {ARCHETYPES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select></div>
        <div><label className="block text-sm font-medium text-lms-text mb-1">Description</label>
          <textarea className="lms-input min-h-[80px]" value={course.description || ""} onChange={(e) => updateCourse("description", e.target.value)} /></div>
        <div><label className="block text-sm font-medium text-lms-text mb-1">Mission</label>
          <textarea className="lms-input min-h-[100px] font-mono text-xs" value={course.mission || ""} onChange={(e) => updateCourse("mission", e.target.value)} placeholder="# Why\n# Success looks like\n# Constraints" /></div>
      </div>

      {/* Modules */}
      <div className="lms-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold">Modules ({modules.length})</h2>
            <p className="text-xs text-lms-text-muted mt-0.5">{publishedCount} published, {modules.length - publishedCount} draft</p>
          </div>
          <div className="flex items-center gap-2">
            {modules.length > 0 && (
              <>
                <button onClick={() => bulkPublish("published")} className="lms-btn text-xs !px-3 !py-1.5 lms-btn-primary">Publish All</button>
                <button onClick={() => bulkPublish("draft")} className="lms-btn text-xs !px-3 !py-1.5 lms-btn-outline">Unpublish All</button>
              </>
            )}
            <button onClick={addModule} className="lms-btn lms-btn-primary text-sm !px-3 !py-1.5">+ Add</button>
          </div>
        </div>

        <div className="space-y-1">
          {modules.sort((a: any, b: any) => a.number - b.number).map((mod: any, idx: number) => (
            <div key={mod.id} className="flex items-center gap-2 p-3 rounded-lg border border-lms-border hover:border-lms-accent/50 transition-colors group">
              {/* Reorder arrows */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button onClick={() => reorderModule(idx, "up")} disabled={idx === 0}
                  className="text-[10px] text-lms-text-muted hover:text-lms-text disabled:opacity-20 p-0.5 leading-none">▲</button>
                <button onClick={() => reorderModule(idx, "down")} disabled={idx === modules.length - 1}
                  className="text-[10px] text-lms-text-muted hover:text-lms-text disabled:opacity-20 p-0.5 leading-none">▼</button>
              </div>
              {/* Number badge */}
              <span className="w-7 h-7 rounded-md bg-lms-bg flex items-center justify-center text-[11px] font-semibold text-lms-text-secondary shrink-0">
                {String(idx + 1).padStart(2, "0")}
              </span>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <Link href={`/admin/courses/${params.id}/modules/${mod.id}/edit`}
                  className="font-medium text-sm text-lms-text hover:text-lms-accent no-underline">
                  {mod.title}
                </Link>
                {mod.description && <p className="text-xs text-lms-text-muted mt-0.5 truncate">{mod.description}</p>}
              </div>
              {/* Status + actions */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={`lms-badge text-[10px] ${mod.status === "published" ? "lms-badge-success" : "lms-badge-warning"}`}>
                  {mod.status}
                </span>
                <Link href={`/admin/courses/${params.id}/modules/${mod.id}/edit`} className="text-xs text-lms-accent hover:underline">Edit</Link>
                <button onClick={() => deleteModule(mod.id)} className="text-xs text-lms-error hover:underline">Del</button>
              </div>
            </div>
          ))}
          {modules.length === 0 && (
            <p className="text-center py-8 text-lms-text-muted text-sm">No modules yet. Add your first module.</p>
          )}
        </div>
      </div>

      {/* View on frontend */}
      <div className="lms-card p-4">
        <h2 className="text-sm font-semibold mb-1">Course URL</h2>
        <p className="text-xs text-lms-text-secondary mb-2">Students access this course at:</p>
        <a href={`/courses/${course.slug}`} className="text-sm text-lms-accent hover:underline font-mono">
          /courses/{course.slug}
        </a>
      </div>

      {/* Danger zone */}
      <div className="lms-card p-5 border-lms-error/30">
        <h2 className="text-base font-semibold text-lms-error mb-2">Danger Zone</h2>
        <p className="text-sm text-lms-text-secondary mb-3">Deleting this course will permanently remove all modules and content. This cannot be undone.</p>
        <div className="flex gap-2">
          <button onClick={async () => {
            if (confirm("Delete this course permanently?")) {
              await fetch(`/api/admin/courses/${params.id}`, { method: "DELETE" });
              router.push("/admin");
            }
          }} className="lms-btn bg-lms-error text-white hover:bg-red-700">Delete Course</button>
        </div>
      </div>
    </div>
  );
}
