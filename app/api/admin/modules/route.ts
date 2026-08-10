import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { modules as modulesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseId, number, title, description, lessonHtml, objectives } = body;
    if (!courseId || number === undefined || !title) {
      return NextResponse.json({ error: "courseId, number, title required" }, { status: 400 });
    }
    const _db = getDb();
    const [created] = await _db.insert(modulesTable).values({
      courseId, number, title, description: description || null,
      lessonHtml: lessonHtml || null, objectives: objectives || null, status: "draft",
    }).returning();
    return NextResponse.json(created, { status: 201 });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
