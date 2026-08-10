import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ course: string; slug: string }> }
) {
  const { course, slug } = await params;
  const cwd = process.cwd();
  const filePath = path.join(cwd, course, "lessons", `${slug}.html`);

  if (!fs.existsSync(filePath)) {
    return new NextResponse("Lesson not found", { status: 404 });
  }

  let html = fs.readFileSync(filePath, "utf-8");

  // Extract lesson title from HTML
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  const lessonTitle = titleMatch ? titleMatch[1].trim() : slug.replace(/-/g, " ");

  const courseDisplay = course === "civil_war" ? "Civil War" : "Vowel Teams";

  // Build prev/next navigation
  const lessonsDir = path.join(cwd, course, "lessons");
  const lessonFiles = fs.readdirSync(lessonsDir)
    .filter((f) => f.endsWith(".html"))
    .sort();
  const currentIndex = lessonFiles.findIndex((f) => f.startsWith(slug));
  const prevSlug = currentIndex > 0 ? lessonFiles[currentIndex - 1].replace(".html", "") : null;
  const nextSlug = currentIndex < lessonFiles.length - 1 ? lessonFiles[currentIndex + 1].replace(".html", "") : null;

  // LMS chrome to inject into the body
  const lmsChrome = `
    <div class="lms-lesson-bar" style="background:#FFFFFF;border-bottom:1px solid #E5E7EB;position:sticky;top:0;z-index:50;">
      <div style="max-width:960px;margin:0 auto;padding:0.75rem 1.5rem;display:flex;align-items:center;gap:1rem;font-family:Inter,system-ui,sans-serif;font-size:0.875rem;">
        <a href="/courses/${course}" style="color:#6B7280;text-decoration:none;display:flex;align-items:center;gap:0.375rem;white-space:nowrap;hover:color:#1C1E2B;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5m7-7l-7 7 7 7"/></svg>
          Back
        </a>
        <span style="color:#D1D5DB;">|</span>
        <span style="color:#6B7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${courseDisplay}</span>
        <span style="color:#D1D5DB;">/</span>
        <span style="color:#1C1E2B;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${lessonTitle}</span>
        <div style="margin-left:auto;display:flex;gap:0.5rem;">
          ${prevSlug ? `<a href="/courses/${course}/lessons/${prevSlug}" style="display:inline-flex;align-items:center;gap:0.25rem;padding:0.375rem 0.75rem;border-radius:6px;border:1px solid #E5E7EB;color:#374151;text-decoration:none;font-size:0.8rem;hover:background:#F9FAFB;">← Prev</a>` : ""}
          ${nextSlug ? `<a href="/courses/${course}/lessons/${nextSlug}" style="display:inline-flex;align-items:center;gap:0.25rem;padding:0.375rem 0.75rem;border-radius:6px;border:1px solid #E5E7EB;color:#374151;text-decoration:none;font-size:0.8rem;background:#4F46E5;color:#fff;border-color:#4F46E5;">Next →</a>` : ""}
        </div>
      </div>
      <div style="height:3px;background:#E5E7EB;">
        <div style="height:100%;width:${((currentIndex + 1) / lessonFiles.length) * 100}%;background:#4F46E5;border-radius:0 2px 2px 0;transition:width 300ms ease;"></div>
      </div>
    </div>
  `;

  // Rewrite relative paths
  html = html.replace(/<body[^>]*>/, (match) => `${match}${lmsChrome}`);
  html = html.replace(/(["'])(\.\.\/assets\/)/g, `$1/courses/${course}/assets/`);
  html = html.replace(/(["'])(\.\.\/assessments\/)/g, `$1/courses/${course}/assessments/`);
  html = html.replace(/(["'])(\.\.\/reference\/)/g, `$1/courses/${course}/reference/`);

  // Add lesson nav to the end of body
  const navFooter = `
    <div style="max-width:840px;margin:2rem auto 3rem;padding:0 1.5rem;font-family:Inter,system-ui,sans-serif;">
      <hr style="border:none;border-top:1px solid #E5E7EB;margin-bottom:1.5rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;">
        ${prevSlug ? `<a href="/courses/${course}/lessons/${prevSlug}" style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.625rem 1.25rem;border-radius:8px;border:1px solid #E5E7EB;color:#374151;text-decoration:none;font-size:0.875rem;font-weight:500;">← Previous Lesson</a>` : '<div></div>'}
        <span style="font-size:0.8rem;color:#9CA3AF;">${currentIndex + 1} of ${lessonFiles.length}</span>
        ${nextSlug ? `<a href="/courses/${course}/lessons/${nextSlug}" style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.625rem 1.25rem;border-radius:8px;background:#4F46E5;color:#fff;text-decoration:none;font-size:0.875rem;font-weight:500;">Next Lesson →</a>` : '<div></div>'}
      </div>
    </div>
  `;
  html = html.replace(/<\/body>/, `${navFooter}</body>`);

  // Inject LMS-specific CSS into the head
  const lmsCss = `
    <style>
      body { padding-top: 0 !important; }
      .lms-lesson-bar + * { margin-top: 0 !important; }
      @media print { .lms-lesson-bar { display:none !important; } }
    </style>
  `;
  html = html.replace(/<\/head>/, `${lmsCss}</head>`);

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
