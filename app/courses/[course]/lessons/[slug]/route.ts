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

  const banner = `
    <div style="background:#F8FAFC;border-bottom:1px solid #E2E8F0;padding:0.5rem 1.5rem;font-size:0.8rem;display:flex;gap:1rem;align-items:center;">
      <a href="/courses/${course}" style="color:#64748B;text-decoration:none;font-family:system-ui;">&larr; Back to ${course}</a>
      <a href="/" style="color:#64748B;text-decoration:none;font-family:system-ui;margin-left:auto;">Teach</a>
    </div>
  `;

  html = html.replace(/<body[^>]*>/, (match) => `${match}${banner}`);
  html = html.replace(/(href|src)=(["'])(\.\.\/assets\/)/g, `$1=$2/courses/${course}/assets/`);
  html = html.replace(/(href|src)=(["'])(\.\.\/assessments\/)/g, `$1=$2/courses/${course}/assessments/`);
  html = html.replace(/(href|src)=(["'])(\.\.\/reference\/)/g, `$1=$2/courses/${course}/reference/`);

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
