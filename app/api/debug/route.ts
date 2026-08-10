import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const cwd = process.cwd();
  const entries: string[] = [];

  try {
    const dirs = fs.readdirSync(cwd, { withFileTypes: true });
    for (const d of dirs) {
      entries.push(`${d.isDirectory() ? "[DIR]" : "[FILE]"} ${d.name}`);
    }
  } catch (e: any) {
    return NextResponse.json({ error: `readdir failed: ${e.message}`, cwd });
  }

  // Check for civil_war lessons
  let civilWarLessons: string[] = [];
  const civilWarDir = path.join(cwd, "civil_war", "lessons");
  try {
    if (fs.existsSync(civilWarDir)) {
      civilWarLessons = fs.readdirSync(civilWarDir);
    } else {
      civilWarLessons = ["DIR NOT FOUND"];
    }
  } catch (e: any) {
    civilWarLessons = [`Error: ${e.message}`];
  }

  return NextResponse.json({ cwd, entries, civilWarLessons });
}
