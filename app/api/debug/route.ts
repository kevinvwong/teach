import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const cwd = process.cwd();
  const results: Record<string, any> = {};

  // Check if civil_war/CLAUDE.md exists
  const claudePath = path.join(cwd, "civil_war", "CLAUDE.md");
  results.claudeExists = fs.existsSync(claudePath);
  results.claudePath = claudePath;

  // Check lesson path
  const lessonPath = path.join(cwd, "civil_war", "lessons", "0002-grants-web.html");
  results.lessonExists = fs.existsSync(lessonPath);
  results.lessonPath = lessonPath;

  // Try reading a lesson
  if (results.lessonExists) {
    const content = fs.readFileSync(lessonPath, "utf-8");
    results.lessonLength = content.length;
    results.lessonHasBody = content.includes("<body");
  }

  // List civil_war dir contents
  try {
    results.civilWarContents = fs.readdirSync(path.join(cwd, "civil_war"));
  } catch (e: any) {
    results.civilWarContents = `Error: ${e.message}`;
  }

  return NextResponse.json(results);
}
