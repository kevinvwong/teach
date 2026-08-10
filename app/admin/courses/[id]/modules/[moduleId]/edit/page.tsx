"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const ARCHETYPE_TEMPLATES: Record<string, string> = {
  history: `<div class="hook">
  <p>Cold open — one or two sentences that grab attention.</p>
</div>

<h2>The Story</h2>
<p>Narrative body with character-driven drama.</p>

<div class="info-box knowledge">
  <p><strong>Key fact:</strong> Insert key facts and data here.</p>
</div>

<div class="arc">
  <h3>Connection Map</h3>
  <p>Cross-module relationship and links to prior material.</p>
</div>

<h2>Retrieval Practice</h2>
<h3>Warm-up</h3>
<ol>
  <li>Fill-the-Blank question... <span class="answer-toggle"><strong>Answer</strong></span></li>
</ol>

<h3>Core Questions</h3>
<ol>
  <li><strong>Clue:</strong> Question text</li>
</ol>

<h3>Answers</h3>
<div class="info-box answers">
  <p>Reveal all answers here.</p>
</div>

<h2>Preview</h2>
<p>What's next and recommended reading.</p>`,
  phonics: `<div class="hook">
  <p>Riddle, puzzle, or visual introducing the concept.</p>
</div>

<div class="rule-box">
  <h3>Rule</h3>
  <p>Explicit instruction: sound, spelling pattern, keyword.</p>
  <div class="rule-example">Example words with target pattern.</div>
</div>

<div class="word-grid">
  <div class="word-card">w<span class="vowel-team">or</span>d</div>
  <div class="word-card">r<span class="vowel-team">ea</span>d</div>
</div>

<div class="game-zone">
  <h3>Game</h3>
  <p class="game-instruction">Activity description.</p>
  <details class="answer-reveal">
    <summary>Check answers</summary>
    <div class="info-box answers">Answers</div>
  </details>
</div>

<div class="info-box">
  <h3>Quick Check</h3>
  <ol class="check-list">
    <li>Question <input type="text"> <span class="answer-toggle"><strong>Answer</strong></span></li>
  </ol>
</div>`,
  math: `<div class="hook">
  <p>Real-world problem or puzzle to spark curiosity.</p>
</div>

<h2>The Concept</h2>
<p>Definition and visual explanation of the concept.</p>

<h2>Worked Example</h2>
<p>Step-by-step walkthrough with annotations.</p>
<ol>
  <li>Step 1...</li>
  <li>Step 2...</li>
</ol>

<h2>Practice</h2>
<ol>
  <li>Easy problem <span class="answer-toggle"><strong>Answer</strong></span></li>
  <li>Medium problem <span class="answer-toggle"><strong>Answer</strong></span></li>
  <li>Hard problem <span class="answer-toggle"><strong>Answer</strong></span></li>
</ol>

<div class="info-box">
  <p><strong>Check:</strong> Quick verification questions.</p>
</div>

<h2>Connection</h2>
<p>How this links to prior and future topics.</p>`,
  custom: `<h2>Lesson Content</h2>
<p>Start writing your lesson content here. Use the available CSS classes from the shared stylesheet.</p>

<div class="info-box">
  <p>Tip: Use .hook for cold opens, .info-box for callouts, .answer-toggle for inline answers.</p>
</div>`,
};

export default function EditModulePage() {
  const params = useParams();
  const router = useRouter();
  const [module, setModule] = useState<any>(null);
  const [courseSlug, setCourseSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    (async () => {
      const modRes = await fetch(`/api/admin/modules/${params.moduleId}`);
      const mod = await modRes.json();
      setModule(mod);

      const courseRes = await fetch(`/api/admin/courses/${params.id}`);
      const course = await courseRes.json();
      setCourseSlug(course.slug);
      setLoading(false);
    })();
  }, [params.id, params.moduleId]);

  const update = async (field: string, value: any) => {
    const updated = { ...module, [field]: value };
    setModule(updated);
    setSaving(true);
    await fetch(`/api/admin/modules/${params.moduleId}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    setSaving(false);
  };

  const generateArchetypeHtml = () => {
    const template = ARCHETYPE_TEMPLATES[module.archetype] || ARCHETYPE_TEMPLATES.custom;
    update("lessonHtml", template);
  };

  if (loading) return <div className="text-center py-12 text-lms-text-muted">Loading...</div>;
  if (!module) return <div className="text-center py-12 text-lms-text-muted">Module not found</div>;

  const previewHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${module.title}</title><link rel="stylesheet" href="https://teach-app-kappa.vercel.app/courses/${courseSlug}/assets/stylesheet.css"><style>body{max-width:840px;margin:2rem auto;padding:0 1.5rem;}</style></head><body>${module.lessonHtml || ""}</body></html>`;

  return (
    <div className="space-y-4 max-w-4xl">
      <Link href={`/admin/courses/${params.id}/edit`} className="text-sm text-lms-text-secondary hover:text-lms-text no-underline">&larr; Back to course</Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{module.title}</h1>
        <div className="flex items-center gap-2">
          {saving && <span className="text-xs text-lms-text-muted">Saving...</span>}
          <button onClick={() => update("status", module.status === "published" ? "draft" : "published")}
            className={`lms-btn text-sm !px-3 !py-1.5 ${module.status === "published" ? "lms-btn-outline" : "lms-btn-primary"}`}>
            {module.status === "published" ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-lms-text mb-1">Module Title</label>
          <input className="lms-input" value={module.title} onChange={(e) => update("title", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-lms-text mb-1">Module Number</label>
          <input type="number" className="lms-input w-24" value={module.number} onChange={(e) => update("number", parseInt(e.target.value) || 0)} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-lms-text mb-1">Description</label>
        <input className="lms-input" value={module.description || ""} onChange={(e) => update("description", e.target.value)} placeholder="Brief module overview" />
      </div>

      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-lms-text">Lesson HTML</label>
        <div className="flex gap-2">
          <button onClick={generateArchetypeHtml} className="text-xs lms-btn lms-btn-outline !px-3 !py-1.5">Generate from archetype</button>
          <button onClick={() => setPreview(!preview)} className={`text-xs lms-btn ${preview ? "lms-btn-primary" : "lms-btn-outline"} !px-3 !py-1.5`}>
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
      </div>

      {preview ? (
        <div className="lms-card overflow-hidden">
          <iframe
            srcDoc={previewHtml}
            className="w-full border-0"
            style={{ height: "70vh", minHeight: "500px" }}
            title="Lesson preview"
          />
        </div>
      ) : (
        <textarea
          className="lms-input font-mono text-xs leading-relaxed min-h-[500px]"
          value={module.lessonHtml || ""}
          onChange={(e) => update("lessonHtml", e.target.value)}
          placeholder="<div class='hook'><p>Start writing your lesson...</p></div>"
        />
      )}

      <div>
        <label className="block text-sm font-medium text-lms-text mb-1">Objectives (JSON)</label>
        <textarea className="lms-input font-mono text-xs min-h-[80px]" value={module.objectives ? JSON.stringify(module.objectives, null, 2) : ""}
          onChange={(e) => {
            try { update("objectives", JSON.parse(e.target.value)); } catch {}
          }} placeholder='["Student will identify 3 key causes", "Student will explain the main event"]' />
      </div>
    </div>
  );
}
