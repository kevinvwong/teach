import { NextRequest, NextResponse } from "next/server";
import { getCourseAsset, getCourseMeta } from "@/lib/courses/loader";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ course: string; path: string[] }> }
) {
  const { course, path } = await params;

  // Validate course
  try { getCourseMeta(course); } catch {
    return new NextResponse("Course not found", { status: 404 });
  }

  const asset = getCourseAsset(course, path);
  if (!asset) {
    return new NextResponse("Asset not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(asset.data), {
    headers: {
      "Content-Type": asset.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
