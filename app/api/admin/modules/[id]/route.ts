import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { modules as modulesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const _db = getDb();
    const mod = await _db.select().from(modulesTable).where(eq(modulesTable.id, id)).limit(1);
    if (!mod.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mod[0]);
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
    const [updated] = await _db.update(modulesTable).set({ ...body, updatedAt: new Date() }).where(eq(modulesTable.id, id)).returning();
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const _db = getDb();
    await _db.delete(modulesTable).where(eq(modulesTable.id, id));
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
