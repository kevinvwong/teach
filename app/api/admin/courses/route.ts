import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const _db = getDb();
    const all = await _db.select().from(courses).orderBy(courses.createdAt);
    return NextResponse.json(all);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, title, description, subtitle, archetype, icon, badge, mission } = body;

    if (!slug || !title) {
      return NextResponse.json({ error: "Slug and title required" }, { status: 400 });
    }

    const _db = getDb();
    const [created] = await _db.insert(courses).values({
      slug, title, description, subtitle, archetype: archetype || "custom",
      icon: icon || "📚", badge: badge || null, mission: mission || null,
      status: "draft",
    }).returning();

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    if (err?.message?.includes("unique") || err?.code === "23505") {
      return NextResponse.json({ error: "A course with this slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
