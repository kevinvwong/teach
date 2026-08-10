"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ARCHETYPES = [
  { value: "history", label: "History / Narrative", desc: "Character-driven, 6-phase structure (Hook → Story → Knowledge → Connection → Practice → Preview)" },
  { value: "phonics", label: "Phonics / Literacy", desc: "Skill-driven, 5-phase structure (Hook → Teach → Practice → Game → Check)" },
  { value: "math", label: "Math / Problem-Solving", desc: "Custom phase structure (Hook → Concept → Worked Example → Practice → Check → Connection)" },
  { value: "custom", label: "Custom / Freeform", desc: "No preset structure — build your own lesson format" },
];

export default function NewCoursePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "", slug: "", description: "", subtitle: "",
    archetype: "custom", icon: "📚", badge: "",
    mission: "", moduleCount: 5,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: any) => setForm({ ...form, [field]: value });

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleCreate = async () => {
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create");
      }
      const course = await res.json();

      // Create modules
      for (let i = 0; i < form.moduleCount; i++) {
        await fetch("/api/admin/modules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: course.id,
            number: i,
            title: i === 0 ? "Overview" : `Module ${i}`,
            status: "draft",
          }),
        });
      }

      router.push(`/admin/courses/${course.id}/edit`);
    } catch (err: any) {
      setError(err.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Course</h1>
        <p className="text-sm text-lms-text-secondary mt-1">Step {step} of 3</p>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-2 rounded-full transition-colors ${s <= step ? "bg-lms-accent" : "bg-lms-border"}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="lms-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-lms-text mb-1">Course Title</label>
            <input className="lms-input" value={form.title} onChange={(e) => {
              update("title", e.target.value);
              if (!form.slug || form.slug === generateSlug(form.title.slice(0, -1))) {
                update("slug", generateSlug(e.target.value));
              }
            }} placeholder="e.g., American Revolution" />
          </div>
          <div>
            <label className="block text-sm font-medium text-lms-text mb-1">URL Slug</label>
            <input className="lms-input font-mono text-sm" value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="american-revolution" />
            <p className="text-xs text-lms-text-muted mt-1">Used in the URL: /courses/{form.slug || "slug"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-lms-text mb-1">Subtitle</label>
            <input className="lms-input" value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)} placeholder="e.g., A Narrative History" />
          </div>
          <div>
            <label className="block text-sm font-medium text-lms-text mb-1">Description</label>
            <textarea className="lms-input min-h-[80px]" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Course overview..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-lms-text mb-1">Icon</label>
              <input className="lms-input" value={form.icon} onChange={(e) => update("icon", e.target.value)} placeholder="📚" />
            </div>
            <div>
              <label className="block text-sm font-medium text-lms-text mb-1">Badge</label>
              <input className="lms-input" value={form.badge} onChange={(e) => update("badge", e.target.value)} placeholder="e.g., History" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={() => setStep(2)} className="lms-btn lms-btn-primary">Next: Archetype →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="lms-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Course Archetype</h2>
          <p className="text-sm text-lms-text-secondary">Choose a teaching structure that determines the lesson phase template.</p>

          <div className="space-y-3">
            {ARCHETYPES.map((a) => (
              <label key={a.value} className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                form.archetype === a.value ? "border-lms-accent bg-lms-accent-light" : "border-lms-border hover:border-lms-accent/50"
              }`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="archetype" value={a.value} checked={form.archetype === a.value}
                    onChange={(e) => update("archetype", e.target.value)} className="accent-lms-accent" />
                  <div>
                    <p className="font-medium text-sm text-lms-text">{a.label}</p>
                    <p className="text-xs text-lms-text-secondary mt-0.5">{a.desc}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-lms-text mb-1">Number of Modules</label>
            <input type="number" min={1} max={30} className="lms-input w-32" value={form.moduleCount}
              onChange={(e) => update("moduleCount", parseInt(e.target.value) || 1)} />
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(1)} className="lms-btn lms-btn-outline">← Back</button>
            <button onClick={() => setStep(3)} className="lms-btn lms-btn-primary">Next: Review →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="lms-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Review & Create</h2>

          <div className="bg-lms-bg rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-lms-text-secondary">Title</span><span>{form.title}</span></div>
            <div className="flex justify-between"><span className="text-lms-text-secondary">Slug</span><span className="font-mono">{form.slug}</span></div>
            <div className="flex justify-between"><span className="text-lms-text-secondary">Archetype</span><span>{ARCHETYPES.find(a => a.value === form.archetype)?.label}</span></div>
            <div className="flex justify-between"><span className="text-lms-text-secondary">Modules</span><span>{form.moduleCount}</span></div>
            {form.description && <div className="flex justify-between"><span className="text-lms-text-secondary">Description</span><span className="text-right max-w-[60%]">{form.description}</span></div>}
          </div>

          {error && <div className="text-sm text-lms-error bg-lms-error-light rounded-lg p-3">{error}</div>}

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(2)} className="lms-btn lms-btn-outline">← Back</button>
            <button onClick={handleCreate} disabled={saving || !form.title || !form.slug}
              className="lms-btn lms-btn-primary disabled:opacity-50">
              {saving ? "Creating..." : "Create Course"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
