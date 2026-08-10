import { NextRequest, NextResponse } from "next/server";
import { getLessonHTML, getCourseMeta } from "@/lib/courses/loader";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ course: string; slug: string }> }
) {
  const { course, slug } = await params;

  // Validate course exists
  try { getCourseMeta(course); } catch {
    return new NextResponse("Course not found", { status: 404 });
  }

  const html = getLessonHTML(course, slug);
  if (!html) {
    return new NextResponse("Lesson not found", { status: 404 });
  }

  // Inject a nav banner into the lesson body
  const banner = `
    <div style="background:#F8FAFC;border-bottom:1px solid #E2E8F0;padding:0.5rem 1.5rem;font-size:0.8rem;display:flex;gap:1rem;align-items:center;">
      <a href="/courses/${course}" style="color:#64748B;text-decoration:none;font-family:system-ui;">&larr; Back to ${course}</a>
      <a href="/" style="color:#64748B;text-decoration:none;font-family:system-ui;margin-left:auto;">Teach</a>
    </div>
  `;

  const modifiedHtml = html.replace(/<body[^>]*>/, (match) => `${match}${banner}`);

  // Rewrite relative asset paths to go through the Next.js proxy
  const rewrites: [RegExp, string][] = [
    [/(href|src)=(["'])(\.\.\/assets\/)/g, `$1=$2/courses/${course}/assets/`],
    [/(href|src)=(["'])(\.\.\/assessments\/)/g, `$1=$2/courses/${course}/assessments/`],
    [/(href|src)=(["'])(\.\.\/reference\/)/g, `$1=$2/courses/${course}/reference/`],
  ];

  let finalHtml = modifiedHtml;
  for (const [pattern, replacement] of rewrites) {
    finalHtml = finalHtml.replace(pattern, replacement);
  }

  return new NextResponse(finalHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
