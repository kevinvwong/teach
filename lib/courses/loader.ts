import fs from "fs";
import path from "path";

const COURSES_DIR = path.resolve(/* turbopackIgnore: true */ process.cwd());

export interface CourseMeta {
  slug: string;
  title: string;
  description: string;
  lessons: LessonMeta[];
  hasAssessment: boolean;
}

export interface LessonMeta {
  slug: string;
  number: number;
  title: string;
  filePath: string;
}

export function getCourseSlugs(): string[] {
  const entries = fs.readdirSync(/* turbopackIgnore: true */ COURSES_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(COURSES_DIR, e.name, "CLAUDE.md")))
    .map((e) => e.name)
    .filter((name) => name !== "node_modules" && name !== ".next" && name !== "app" && name !== "lib" && name !== "public");
}

export function getCourseMeta(slug: string): CourseMeta {
  const courseDir = path.join(/* turbopackIgnore: true */ COURSES_DIR, slug);
  const lessonsDir = path.join(courseDir, "lessons");
  const assessmentsDir = path.join(courseDir, "assessments");

  let title = slug;
  let description = "";

  // Read MISSION.md for title
  const missionPath = path.join(courseDir, "MISSION.md");
  if (fs.existsSync(missionPath)) {
    const content = fs.readFileSync(missionPath, "utf-8");
    const titleMatch = content.match(/^# Mission:\s*(.+)/m);
    const descMatch = content.match(/## Why\s*\n(.+)/);
    if (titleMatch) title = titleMatch[1].trim();
    if (descMatch) description = descMatch[1].trim();
  }

  // Read lessons directory
  const lessons: LessonMeta[] = [];
  if (fs.existsSync(lessonsDir)) {
    const files = fs.readdirSync(lessonsDir).filter((f) => f.endsWith(".html"));
    for (const file of files) {
      const match = file.match(/^(\d{4})-(.+)\.html$/);
      if (match) {
        const num = parseInt(match[1]);
        const name = match[2].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        lessons.push({
          slug: file.replace(".html", ""),
          number: num,
          title: name,
          filePath: path.join(lessonsDir, file),
        });
      }
    }
    lessons.sort((a, b) => a.number - b.number);
  }

  return {
    slug,
    title,
    description,
    lessons,
    hasAssessment: fs.existsSync(assessmentsDir),
  };
}

export function getLessonHTML(courseSlug: string, lessonSlug: string): string | null {
  const filePath = path.join(/* turbopackIgnore: true */ COURSES_DIR, courseSlug, "lessons", `${lessonSlug}.html`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

export function getCourseAsset(courseSlug: string, assetPath: string[]): { data: Buffer; contentType: string } | null {
  const filePath = path.join(/* turbopackIgnore: true */ COURSES_DIR, courseSlug, ...assetPath);
  if (!fs.existsSync(filePath)) return null;

  const ext = path.extname(filePath).toLowerCase();
  const contentTypeMap: Record<string, string> = {
    ".css": "text/css",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".html": "text/html",
    ".json": "application/json",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".ttf": "font/ttf",
    ".tsv": "text/tab-separated-values",
    ".md": "text/markdown",
    ".pdf": "application/pdf",
  };

  return {
    data: fs.readFileSync(filePath),
    contentType: contentTypeMap[ext] || "application/octet-stream",
  };
}

export function getItemBank(courseSlug: string): any {
  const bankPath = path.join(/* turbopackIgnore: true */ COURSES_DIR, courseSlug, "assessments", "item-bank.json");
  if (!fs.existsSync(bankPath)) return null;
  return JSON.parse(fs.readFileSync(bankPath, "utf-8"));
}

export function stripHTMLBody(fullHtml: string): string {
  const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return bodyMatch ? bodyMatch[1].trim() : fullHtml;
}
