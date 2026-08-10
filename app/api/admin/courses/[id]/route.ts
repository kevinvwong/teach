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

    // Handle Pexels image fetch
    if (body.pexelsQuery) {
      const query = body.pexelsQuery as string;
      const apiKey = process.env.PEXELS_API_KEY || "";
      if (!apiKey) {
        return NextResponse.json({ error: "PEXELS_API_KEY not configured" }, { status: 400 });
      }
      const params = new URLSearchParams({ query, per_page: "5", orientation: "landscape" });
      const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
        headers: { Authorization: apiKey },
      });
      if (!res.ok) return NextResponse.json({ error: "Pexels search failed" }, { status: 502 });
      const data = await res.json();
      const photo = data.photos?.[0];
      if (!photo) return NextResponse.json({ error: "No images found" }, { status: 404 });

      const [updated] = await _db.update(courses).set({
        imageUrl: photo.src.large2x || photo.src.large,
        imagePhotographer: photo.photographer,
        imagePhotographerUrl: photo.photographer_url,
        updatedAt: new Date(),
      }).where(eq(courses.id, id)).returning();
      if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(updated);
    }

    // Normal update
    const { pexelsQuery, ...updateData } = body;
    const [updated] = await _db.update(courses).set({ ...updateData, updatedAt: new Date() }).where(eq(courses.id, id)).returning();
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
