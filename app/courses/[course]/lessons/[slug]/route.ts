import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDb } from "@/lib/db";
import { courses, modules as modulesTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ course: string; slug: string }> }
) {
  const { course, slug } = await params;
  const cwd = process.cwd();
  const filePath = path.join(cwd, course, "lessons", `${slug}.html`);

  // Try filesystem first
  let html: string | null = null;
  let isDbCourse = false;
  let dbTitle = "";

  if (fs.existsSync(filePath)) {
    html = fs.readFileSync(filePath, "utf-8");
  } else {
    // Try database
    try {
      const _db = getDb();
      const [courseRow] = await _db.select().from(courses).where(eq(courses.slug, course)).limit(1);
      if (courseRow) {
        isDbCourse = true;
        dbTitle = courseRow.title;
        // slug is the module number
        const modNum = parseInt(slug.replace(/^\D+/g, "")) || 0;
        const [mod] = await _db.select().from(modulesTable)
          .where(and(eq(modulesTable.courseId, courseRow.id), eq(modulesTable.number, modNum)))
          .limit(1);
        if (mod && mod.lessonHtml) {
          const title = mod.title;
          html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${title} — ${courseRow.title}</title><link rel="stylesheet" href="/courses/${course}/assets/stylesheet.css"></head><body>${mod.lessonHtml}</body></html>`;
        }
      }
    } catch { /* DB not available */ }
  }

  if (!html) {
    return new NextResponse("Lesson not found", { status: 404 });
  }

  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  const lessonTitle = titleMatch ? titleMatch[1].trim() : slug.replace(/-/g, " ");
  const courseDisplay = isDbCourse ? dbTitle : course === "civil_war" ? "Civil War" : "Vowel Teams";

  // Build prev/next nav
  let prevSlug: string | null = null, nextSlug: string | null = null;
  let currentIndex = 0, totalLessons = 0;

  if (isDbCourse) {
    // DB course — use modules from the course
    const _db = getDb();
    const [courseRow] = await _db.select().from(courses).where(eq(courses.slug, course)).limit(1);
    if (courseRow) {
      const dbModules = await _db.select().from(modulesTable)
        .where(eq(modulesTable.courseId, courseRow.id)).orderBy(modulesTable.number);
      totalLessons = dbModules.length;
      const modNum = parseInt(slug.replace(/^\D+/g, "")) || 0;
      currentIndex = dbModules.findIndex((m: any) => m.number === modNum);
      if (currentIndex > 0) prevSlug = `lesson-${String(dbModules[currentIndex - 1].number).padStart(4, "0")}`;
      if (currentIndex < dbModules.length - 1) nextSlug = `lesson-${String(dbModules[currentIndex + 1].number).padStart(4, "0")}`;
      if (currentIndex === -1) currentIndex = 0;
    }
  } else {
    const lessonsDir = path.join(cwd, course, "lessons");
    const lessonFiles = fs.readdirSync(lessonsDir).filter((f) => f.endsWith(".html")).sort();
    totalLessons = lessonFiles.length;
    currentIndex = lessonFiles.findIndex((f) => f.startsWith(slug));
    if (currentIndex > 0) prevSlug = lessonFiles[currentIndex - 1].replace(".html", "");
    if (currentIndex < lessonFiles.length - 1) nextSlug = lessonFiles[currentIndex + 1].replace(".html", "");
    if (currentIndex === -1) currentIndex = 0;
  }

  const lmsChrome = `
    <div class="lms-lesson-bar" style="background:#FFFFFF;border-bottom:1px solid #E5E7EB;position:sticky;top:0;z-index:50;">
      <div style="max-width:960px;margin:0 auto;padding:0.75rem 1.5rem;display:flex;align-items:center;gap:1rem;font-family:Inter,system-ui,sans-serif;font-size:0.875rem;">
        <a href="/courses/${course}" style="color:#6B7280;text-decoration:none;display:flex;align-items:center;gap:0.375rem;white-space:nowrap;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5m7-7l-7 7 7 7"/></svg>
          Back
        </a>
        <span style="color:#D1D5DB;">|</span>
        <span style="color:#6B7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${courseDisplay}</span>
        <span style="color:#D1D5DB;">/</span>
        <span style="color:#1C1E2B;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${lessonTitle}</span>
        <div style="margin-left:auto;display:flex;gap:0.5rem;">
          ${prevSlug ? `<a href="/courses/${course}/lessons/${prevSlug}" style="display:inline-flex;align-items:center;gap:0.25rem;padding:0.375rem 0.75rem;border-radius:6px;border:1px solid #E5E7EB;color:#374151;text-decoration:none;font-size:0.8rem;">← Prev</a>` : ""}
          ${nextSlug ? `<a href="/courses/${course}/lessons/${nextSlug}" style="display:inline-flex;align-items:center;gap:0.25rem;padding:0.375rem 0.75rem;border-radius:6px;background:#4F46E5;color:#fff;text-decoration:none;font-size:0.8rem;">Next →</a>` : ""}
        </div>
      </div>
      <div style="height:3px;background:#E5E7EB;">
        <div style="height:100%;width:${totalLessons > 0 ? ((currentIndex + 1) / totalLessons) * 100 : 0}%;background:#4F46E5;border-radius:0 2px 2px 0;transition:width 300ms ease;"></div>
      </div>
    </div>
  `;

  html = html.replace(/<body[^>]*>/, (match) => `${match}${lmsChrome}`);
  html = html.replace(/(["'])(\.\.\/assets\/)/g, `$1/courses/${course}/assets/`);
  html = html.replace(/(["'])(\.\.\/assessments\/)/g, `$1/courses/${course}/assessments/`);
  html = html.replace(/(["'])(\.\.\/reference\/)/g, `$1/courses/${course}/reference/`);

  const quizSection = `
    <div style="max-width:840px;margin:2.5rem auto 1rem;padding:0 1.5rem;font-family:Inter,system-ui,sans-serif;">
      <hr style="border:none;border-top:1px solid #E5E7EB;margin-bottom:2rem;">
      <h2 style="font-size:1.25rem;font-weight:600;margin-bottom:0.25rem;color:#1C1E2B;">Check Your Understanding</h2>
      <p style="font-size:0.875rem;color:#6B7280;margin-bottom:1.5rem;">Adaptive quiz — questions adjust to your level using Item Response Theory.</p>

      <div id="quiz-container"
           data-item-bank="/courses/${course}/assessments/item-bank.json"
           data-domain="${course}"
           data-api-endpoint="/api/irt-score"
           data-n-items="5"
           data-se-threshold="0.5"
           style="background:#FFFFFF;border:1px solid #E5E7EB;border-radius:12px;padding:1.5rem;">
        <noscript>
          <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:1rem;color:#991B1B;font-size:0.875rem;">
            <p style="font-weight:500;">JavaScript required</p>
            <p style="margin-top:0.25rem;">This adaptive quiz requires JavaScript for IRT scoring.</p>
          </div>
        </noscript>
        <div class="quiz-progress" style="display:none;font-size:0.8rem;color:#9CA3AF;margin-bottom:1rem;">
          Question <span id="q-num">0</span> of <span id="q-total">0</span>
        </div>
        <div id="quiz-question" style="font-size:1rem;line-height:1.6;color:#1C1E2B;margin-bottom:1rem;"></div>
        <div id="quiz-options" style="display:flex;flex-direction:column;gap:0.5rem;"></div>
        <div id="quiz-feedback" style="margin-top:1rem;"></div>
      </div>
    </div>
    ${!isDbCourse ? `<script src="/courses/${course}/assessments/quiz-renderer.js" defer></script>` : ""}
  `;

  const navFooter = `
    <div style="max-width:840px;margin:2rem auto 3rem;padding:0 1.5rem;font-family:Inter,system-ui,sans-serif;">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;">
        ${prevSlug ? `<a href="/courses/${course}/lessons/${prevSlug}" style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.625rem 1.25rem;border-radius:8px;border:1px solid #E5E7EB;color:#374151;text-decoration:none;font-size:0.875rem;font-weight:500;">← Previous Lesson</a>` : '<div></div>'}
        <span style="font-size:0.8rem;color:#9CA3AF;">${currentIndex + 1} of ${totalLessons}</span>
        ${nextSlug ? `<a href="/courses/${course}/lessons/${nextSlug}" style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.625rem 1.25rem;border-radius:8px;background:#4F46E5;color:#fff;text-decoration:none;font-size:0.875rem;font-weight:500;">Next Lesson →</a>` : '<div></div>'}
      </div>
    </div>
  `;

  html = html.replace(/<\/body>/, `${quizSection}${navFooter}</body>`);

  const lmsCss = `
    <style>
      body { padding-top: 0 !important; }
      .lms-lesson-bar + * { margin-top: 0 !important; }
      @media print { .lms-lesson-bar { display:none !important; } }
      .quiz-option { display:flex;align-items:center;gap:0.75rem;padding:0.75rem 1rem;border:1px solid #E5E7EB;border-radius:8px;cursor:pointer;transition:all 150ms ease;font-size:0.95rem; }
      .quiz-option:hover { border-color:#4F46E5;background:#EEF2FF; }
      .quiz-option input[type="radio"] { accent-color:#4F46E5;width:16px;height:16px; }
      .quiz-option input[type="radio"]:checked + span { font-weight:500;color:#1C1E2B; }
      .quiz-option:has(input:checked) { border-color:#4F46E5;background:#EEF2FF; }
      #quiz-free-response { width:100%;padding:0.75rem 1rem;border:1px solid #E5E7EB;border-radius:8px;font-size:0.95rem;transition:border-color 150ms ease; }
      #quiz-free-response:focus { border-color:#4F46E5;outline:none;box-shadow:0 0 0 3px rgba(79,70,229,0.1); }
    </style>
  `;
  html = html.replace(/<\/head>/, `${lmsCss}</head>`);

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
