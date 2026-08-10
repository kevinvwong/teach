import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { courses, modules as modulesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const _db = getDb();
    const [course] = await _db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const mods = await _db.select().from(modulesTable)
      .where(eq(modulesTable.courseId, course.id))
      .orderBy(modulesTable.number);

    // Build imsmanifest.xml
    const timestamp = new Date().toISOString().split("T")[0];
    const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="Manifest-${escapeXml(slug)}"
  xmlns="http://www.imsglobal.org/xsd/imsccv1p3/imscp_v1p1"
  xmlns:lomimscc="http://ltsc.ieee.org/xsd/imsccv1p3/LOM/manifest"
  xmlns:lom="http://ltsc.ieee.org/xsd/imsccv1p3/LOM/resource"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <metadata>
    <schema>IMS Common Cartridge</schema>
    <schemaversion>1.3.0</schemaversion>
    <lomimscc:lom>
      <lomimscc:general>
        <lomimscc:title><lomimscc:string language="en-US">${escapeXml(course.title)}</lomimscc:string></lomimscc:title>
        <lomimscc:description><lomimscc:string language="en-US">${escapeXml(course.description || "")}</lomimscc:string></lomimscc:description>
      </lomimscc:general>
      <lomimscc:lifeCycle>
        <lomimscc:contribute>
          <lomimscc:date><lomimscc:dateTime>${timestamp}</lomimscc:dateTime></lomimscc:date>
        </lomimscc:contribute>
      </lomimscc:lifeCycle>
    </lomimscc:lom>
  </metadata>
  <organizations>
    <organization identifier="org_1" structure="rooted-hierarchy">
      <item identifier="root_item">
        <title>${escapeXml(course.title)}</title>
        ${mods.map((m, i) => `
        <item identifier="item_mod_${i}" identifierref="res_mod_${i}">
          <title>${escapeXml(m.title)}</title>
        </item>`).join("")}
      </item>
    </organization>
  </organizations>
  <resources>
    ${mods.map((m, i) => {
      const hasContent = m.lessonHtml && m.lessonHtml.length > 50;
      if (!hasContent) return "";
      const resId = `res_mod_${i}`;
      return `
    <resource identifier="${resId}" type="webcontent" href="web_resources/module_${i}.html">
      <file href="web_resources/module_${i}.html"/>
    </resource>`;
    }).filter(Boolean).join("")}
  </resources>
</manifest>`;

    // Build ZIP manually (store method, no compression needed for small exports)
    const files: { name: string; content: Buffer }[] = [];

    // Add manifest
    files.push({ name: "imsmanifest.xml", content: Buffer.from(manifest, "utf-8") });

    // Add module HTML files
    for (const [i, m] of mods.entries()) {
      if (!m.lessonHtml || m.lessonHtml.length < 50) continue;
      const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${escapeXml(m.title)}</title><link rel="stylesheet" href="../shared/stylesheet.css"></head><body style="max-width:840px;margin:2rem auto;padding:0 1.5rem;font-family:system-ui;">${m.lessonHtml}</body></html>`;
      files.push({ name: `web_resources/module_${i}.html`, content: Buffer.from(html, "utf-8") });
    }

    // Build ZIP using store method
    const zipBuf = buildZip(files);

    return new NextResponse(new Uint8Array(zipBuf), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${slug}.imscc"`,
        "Content-Length": String(zipBuf.length),
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

function buildZip(files: { name: string; content: Buffer }[]): Buffer {
  const parts: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;

  for (const f of files) {
    const nameBuf = Buffer.from(f.name, "utf-8");
    const crc = crc32(f.content);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0, 6);
    header.writeUInt16LE(0, 8);
    header.writeUInt16LE(0, 10);
    header.writeUInt16LE(0, 12);
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(f.content.length, 18);
    header.writeUInt32LE(f.content.length, 22);
    header.writeUInt16LE(nameBuf.length, 26);
    header.writeUInt16LE(0, 28);
    parts.push(header, nameBuf, f.content);

    const cenHeader = Buffer.alloc(46);
    cenHeader.writeUInt32LE(0x02014b50, 0);
    cenHeader.writeUInt16LE(20, 4);
    cenHeader.writeUInt16LE(20, 6);
    cenHeader.writeUInt16LE(0, 8);
    cenHeader.writeUInt16LE(0, 10);
    cenHeader.writeUInt16LE(0, 12);
    cenHeader.writeUInt32LE(crc, 16);
    cenHeader.writeUInt32LE(f.content.length, 20);
    cenHeader.writeUInt32LE(f.content.length, 24);
    cenHeader.writeUInt16LE(nameBuf.length, 28);
    cenHeader.writeUInt16LE(0, 30);
    cenHeader.writeUInt16LE(0, 32);
    cenHeader.writeUInt16LE(0, 34);
    cenHeader.writeUInt16LE(0, 36);
    cenHeader.writeUInt32LE(0, 38);
    cenHeader.writeUInt32LE(offset, 42);
    central.push(cenHeader, nameBuf);
    offset += 30 + nameBuf.length + f.content.length;
  }

  const centralStart = offset;
  const centralBuf = Buffer.concat(central);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(files.length, 8);
  endRecord.writeUInt16LE(files.length, 10);
  endRecord.writeUInt32LE(centralBuf.length, 12);
  endRecord.writeUInt32LE(centralStart, 16);
  endRecord.writeUInt16LE(0, 20);

  return Buffer.concat([...parts, centralBuf, endRecord]);
}

function crc32(buf: Buffer): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
