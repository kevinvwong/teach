import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { itemCalibrations } from "../lib/db/schema";
import fs from "fs";
import path from "path";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  const courses = ["civil_war", "vowel-teams"];

  for (const course of courses) {
    const bankPath = path.join(process.cwd(), course, "assessments", "item-bank.json");
    if (!fs.existsSync(bankPath)) {
      console.log(`No item bank found for ${course}`);
      continue;
    }

    let raw = fs.readFileSync(bankPath, "utf-8");
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    const bank = JSON.parse(raw);
    console.log(`Seeding ${bank.items.length} items for ${course}...`);

    for (const item of bank.items) {
      const p = item.irt || item;
      try {
        await db.insert(itemCalibrations).values({
          itemId: item.id,
          itemBank: course,
          domain: item.domain || course,
          a: String(p.a ?? 1),
          b: String(p.b ?? 0),
          c: String(p.c ?? 0.25),
          status: item.calibration?.status || "draft",
        }).onConflictDoNothing({ target: itemCalibrations.itemId });
      } catch (err) {
        console.warn(`  Skipped ${item.id}: ${err instanceof Error ? err.message : err}`);
      }
    }

    console.log(`  Done: ${bank.items.length} items for ${course}`);
  }

  console.log("Seed complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
