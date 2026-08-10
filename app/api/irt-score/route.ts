import { NextRequest, NextResponse } from "next/server";
import { getItemBank } from "@/lib/courses/loader";
import { estimateThetaEAP, selectNextItem, classifyTheta, itemInfo, type ItemParams } from "@/lib/irt/scoring";
import { getDb } from "@/lib/db";
import { assessmentResponses, quizSessions } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, itemBank: bankName, responses, currentTheta, courseSlug } = body;

    if (!sessionId || !bankName || !responses || !Array.isArray(responses)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Load item bank
    const bank = getItemBank(courseSlug || bankName.split("-")[0]);
    if (!bank || !bank.items || bank.items.length === 0) {
      return NextResponse.json({ error: `Item bank "${bankName}" not found` }, { status: 404 });
    }

    // Filter active items for this domain
    const allItems = bankName
      ? bank.items.filter((i: any) => i.domain === bankName && (!i.calibration || i.calibration.status === "active"))
      : bank.items.filter((i: any) => !i.calibration || i.calibration.status === "active");

    // Build scored responses
    const scoredResponses = responses
      .map((r: any) => {
        const item = allItems.find((i: any) => i.id === r.itemId);
        if (!item) return null;
        return { a: item.a, b: item.b, c: item.c, correct: r.correct };
      })
      .filter((r: any): r is { a: number; b: number; c: number; correct: boolean } => r !== null);

    if (scoredResponses.length === 0) {
      return NextResponse.json({ error: "No valid responses" }, { status: 400 });
    }

    // Store responses in database
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
      console.warn("DB insert failed (non-fatal):", dbErr);
    }

    // Estimate theta
    const prior = currentTheta != null ? parseFloat(currentTheta) : 0;
    const { theta, se } = estimateThetaEAP(scoredResponses, prior);

    // Select next items
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
    const info = allItems.reduce(
      (sum: number, item: any) => sum + itemInfo(theta, item.a, item.b, item.c),
      0
    );

    // Update session record
    try {
      const _db = getDb();
      await _db
        .insert(quizSessions)
        .values({
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
        })
        .onConflictDoUpdate({
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
      console.warn("DB upsert failed (non-fatal):", dbErr);
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
    console.error("IRT scoring error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
