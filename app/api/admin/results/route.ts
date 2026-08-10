import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { quizSessions, assessmentResponses } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const _db = getDb();

    // Get summary stats per course
    const summary = await _db.execute(sql`
      SELECT
        qs.course_slug,
        qs.item_bank,
        COUNT(DISTINCT qs.id) as total_sessions,
        COUNT(DISTINCT qs.student_id) as unique_students,
        AVG(CAST(qs.final_theta AS numeric)) as avg_theta,
        AVG(CAST(qs.final_theta_se AS numeric)) as avg_se,
        COUNT(CASE WHEN qs.completed = true THEN 1 END) as completed_sessions
      FROM quiz_sessions qs
      WHERE qs.course_slug IS NOT NULL
      GROUP BY qs.course_slug, qs.item_bank
      ORDER BY qs.course_slug
    `);

    // Get recent sessions
    const recent = await _db.select()
      .from(quizSessions)
      .orderBy(sql`started_at DESC`)
      .limit(20);

    // Get item response counts
    const itemStats = await _db.execute(sql`
      SELECT
        ar.item_bank,
        ar.item_id,
        COUNT(*) as total_responses,
        SUM(CASE WHEN ar.correct = true THEN 1 ELSE 0 END) as correct_count,
        AVG(ar.response_time_ms) as avg_response_time_ms
      FROM assessment_responses ar
      GROUP BY ar.item_bank, ar.item_id
      ORDER BY ar.item_bank, total_responses DESC
      LIMIT 50
    `);

    return NextResponse.json({
      summary: summary.rows || [],
      recent: recent || [],
      itemStats: itemStats.rows || [],
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
