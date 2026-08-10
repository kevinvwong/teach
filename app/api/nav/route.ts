import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { courses } from "@/lib/db/schema";

// Filesystem courses — detected by the loader
const FS_COURSES = [
  { slug: "civil_war", label: "Civil War", icon: "⚔", subtitle: "1820–1865" },
  { slug: "vowel-teams", label: "Vowel Teams", icon: "🔤", subtitle: "Phonics Ages 9–11" },
];

// Business series — a curated group
const BUSINESS_SERIES = [
  { slug: "green-advantage", label: "The Green Advantage", icon: "🏌️", subtitle: "Golf & Networking" },
  { slug: "power-table", label: "The Power Table", icon: "🍽", subtitle: "Dining & Etiquette" },
  { slug: "inner-circle", label: "The Inner Circle", icon: "🏛", subtitle: "Private Clubs" },
  { slug: "offsite-advantage", label: "The Off-Site Advantage", icon: "🎤", subtitle: "Conferences & Events" },
];

export async function GET() {
  // Fetch DB courses for additional dynamic courses
  let dbCourses: any[] = [];
  try {
    const _db = getDb();
    dbCourses = await _db.select({ slug: courses.slug, title: courses.title, icon: courses.icon, workflowPhase: courses.workflowPhase })
      .from(courses);
  } catch {}

  // Combine: FS courses are always available, DB courses add any extras
  const allSlugs = new Set([...FS_COURSES, ...BUSINESS_SERIES, ...dbCourses].map(c => c.slug));

  // Find any DB courses not already in the curated lists
  const extraDBCourses = dbCourses
    .filter(c => !allSlugs.has(c.slug) && c.workflowPhase !== "foundation")
    .map(c => ({ slug: c.slug, label: c.title, icon: c.icon || "📚", subtitle: "" }));

  return NextResponse.json({
    main: [{ slug: "", label: "Dashboard", icon: "□", subtitle: "" }],
    businessSeries: BUSINESS_SERIES,
    academic: FS_COURSES,
    extras: extraDBCourses,
  });
}
