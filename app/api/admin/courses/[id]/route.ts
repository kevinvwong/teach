import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { courses, modules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const _db = getDb();
    const course = await _db.select().from(courses).where(eq(courses.id, id)).limit(1);
    if (!course.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const mods = await _db.select().from(modules).where(eq(modules.courseId, id)).orderBy(modules.number);
    return NextResponse.json({ ...course[0], modules: mods });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const _db = getDb();
    const [updated] = await _db.update(courses).set({ ...body, updatedAt: new Date() }).where(eq(courses.id, id)).returning();
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch { return NextResponse.json({ error: "Failed to update" }, { status: 500 }); }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const _db = getDb();
    await _db.delete(courses).where(eq(courses.id, id));
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Failed to delete" }, { status: 500 }); }
}
