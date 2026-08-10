import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { estimateThetaEAP, selectNextItem, classifyTheta, itemInfo } from "@/lib/irt/scoring";
import { getDb } from "@/lib/db";
import { assessmentResponses, quizSessions } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, itemBank: bankName, responses, currentTheta, courseSlug } = body;

    if (!sessionId || !bankName || !responses || !Array.isArray(responses)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const courseId = courseSlug || bankName.split("-")[0];
    const bankPath = path.join(process.cwd(), courseId, "assessments", "item-bank.json");
    if (!fs.existsSync(bankPath)) {
      return NextResponse.json({ error: `Item bank not found: ${bankPath}` }, { status: 404 });
    }

    let raw = fs.readFileSync(bankPath, "utf-8");
    const bank = JSON.parse(raw);
    const allItems = bank.items.filter((i: any) =>
      !i.calibration || i.calibration.status !== "retired"
    );

    const scoredResponses = responses
      .map((r: any) => {
        const item = allItems.find((i: any) => i.id === r.itemId);
        if (!item) return null;
        return { a: item.a ?? item.irt?.a ?? 1, b: item.b ?? item.irt?.b ?? 0, c: item.c ?? item.irt?.c ?? 0.25, correct: r.correct };
      })
      .filter((r: any): r is { a: number; b: number; c: number; correct: boolean } => r !== null);

    if (scoredResponses.length === 0) {
      return NextResponse.json({ error: "No valid responses" }, { status: 400 });
    }

    try {
      const _db = getDb();
      for (const r of responses) {
        await _db.insert(assessmentResponses).values({
          sessionId,
          itemId: r.itemId,
          itemBank: bankName,
          response: r.response,
          correct: r.correct,
          responseTimeMs: r.responseTimeMs || null,
        });
      }
    } catch (dbErr) {
      console.warn("DB insert failed:", dbErr);
    }

    const prior = currentTheta != null ? parseFloat(currentTheta) : 0;
    const { theta, se } = estimateThetaEAP(scoredResponses, prior);

    const exposedIds = new Set(responses.map((r: any) => r.itemId));
    const suggestedNextItems: string[] = [];
    for (let i = 0; i < 2; i++) {
      const next = selectNextItem(allItems, theta, exposedIds);
      if (next) {
        suggestedNextItems.push(next.id);
        exposedIds.add(next.id);
      }
    }

    const classification = classifyTheta(theta);
    const sessionComplete = se < 0.4 || responses.length >= 20;
    const info = allItems.reduce((sum: number, item: any) => {
      const a = item.a ?? item.irt?.a ?? 1;
      const b = item.b ?? item.irt?.b ?? 0;
      const c = item.c ?? item.irt?.c ?? 0.25;
      return sum + itemInfo(theta, a, b, c);
    }, 0);

    try {
      const _db = getDb();
      await _db.insert(quizSessions).values({
        id: sessionId,
        itemBank: bankName,
        courseSlug: courseSlug || null,
        nItems: responses.length,
        nCorrect: responses.filter((r: any) => r.correct).length,
        finalTheta: String(theta),
        finalThetaSE: String(se),
        classification,
        completed: sessionComplete,
        completedAt: sessionComplete ? new Date() : null,
      }).onConflictDoUpdate({
        target: quizSessions.id,
        set: {
          nItems: responses.length,
          nCorrect: responses.filter((r: any) => r.correct).length,
          finalTheta: String(theta),
          finalThetaSE: String(se),
          classification,
          completed: sessionComplete,
          completedAt: sessionComplete ? new Date() : null,
        },
      });
    } catch (dbErr) {
      console.warn("DB upsert failed:", dbErr);
    }

    return NextResponse.json({
      theta: Math.round(theta * 100) / 100,
      thetaSE: Math.round(se * 100) / 100,
      testInfo: Math.round(info * 10) / 10,
      suggestedNextItems,
      classification,
      sessionComplete,
      confidenceInterval: [
        Math.round((theta - 1.96 * se) * 100) / 100,
        Math.round((theta + 1.96 * se) * 100) / 100,
      ],
    });
  } catch (err) {
    console.error("IRT error:", err);
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : "";
    return NextResponse.json({ error: "Internal server error", detail: message, stack: stack?.split("\n").slice(0,5).join(" | ") }, { status: 500 });
  }
}
