/**
 * irt-score.mjs
 *
 * Vercel Edge Function for IRT scoring.
 * Accepts student responses, estimates theta via EAP, returns next items.
 *
 * Deploy as: vercel deploy
 * Endpoint: POST /api/irt-score
 *
 * Reads item bank from file system or Neon/Drizzle.
 * Stores responses in Neon via Drizzle ORM.
 */

import { createClient } from '@vercel/postgres';
import { sql } from '@vercel/postgres';

// 3PL Item Response Function
function irt3PL(theta, a, b, c) {
  const D = 1.702;
  return c + (1 - c) / (1 + Math.exp(-D * a * (theta - b)));
}

// Item Information Function
function itemInfo(theta, a, b, c) {
  const P = irt3PL(theta, a, b, c);
  const Q = 1 - P;
  if (P <= c || P >= 1) return 0;
  return (a * a * Q * (P - c) * (P - c)) / ((1 - c) * (1 - c) * P);
}

// Likelihood function
function likelihood(theta, responses) {
  let logL = 0;
  for (const r of responses) {
    const P = irt3PL(theta, r.a, r.b, r.c);
    if (P <= 0 || P >= 1) return -Infinity;
    logL += r.correct ? Math.log(P) : Math.log(1 - P);
  }
  return logL;
}

// EAP Theta Estimation (Expected A Posteriori)
function estimateThetaEAP(responses, priorMean = 0, priorSD = 1) {
  // Gauss-Hermite quadrature with 49 points
  const nQuad = 49;
  const thetaMin = -6;
  const thetaMax = 6;
  const step = (thetaMax - thetaMin) / (nQuad - 1);

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < nQuad; i++) {
    const theta = thetaMin + i * step;
    const prior = Math.exp(-0.5 * ((theta - priorMean) / priorSD) ** 2);
    const L = Math.exp(likelihood(theta, responses));

    numerator += theta * L * prior;
    denominator += L * prior;
  }

  const thetaEAP = denominator > 0 ? numerator / denominator : priorMean;

  // Standard error (posterior SD)
  let varNumerator = 0;
  for (let i = 0; i < nQuad; i++) {
    const theta = thetaMin + i * step;
    const prior = Math.exp(-0.5 * ((theta - priorMean) / priorSD) ** 2);
    const L = Math.exp(likelihood(theta, responses));
    varNumerator += (theta - thetaEAP) ** 2 * L * prior;
  }
  const thetaSE = denominator > 0 ? Math.sqrt(varNumerator / denominator) : priorSD;

  return { theta: thetaEAP, se: thetaSE };
}

// Test Information at theta
function testInfo(theta, items) {
  return items.reduce((sum, item) => sum + itemInfo(theta, item.a, item.b, item.c), 0);
}

// Select next item (Maximum Fisher Information)
function selectNextItem(items, theta, exposedIds) {
  let best = null;
  let bestInfo = -1;

  for (const item of items) {
    if (exposedIds.has(item.id)) continue;
    const info = itemInfo(theta, item.a, item.b, item.c);
    if (info > bestInfo) {
      bestInfo = info;
      best = item;
    }
  }
  return best;
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, itemBank: bankName, responses, currentTheta } = request.body;

    if (!sessionId || !bankName || !responses || !Array.isArray(responses)) {
      return response.status(400).json({ error: 'Missing required fields' });
    }

    // Load item bank from Neon/Drizzle
    const db = createClient();
    await db.connect();

    const bankResult = await db.sql`
      SELECT item_id, a, b, c, stem, options, correct, domain
      FROM item_calibrations
      WHERE item_bank = ${bankName} AND status = 'active'
    `;
    const allItems = bankResult.rows;

    if (allItems.length === 0) {
      await db.end();
      return response.status(404).json({ error: `Item bank "${bankName}" not found` });
    }

    // Build response array with item parameters
    const scoredResponses = responses.map(r => {
      const item = allItems.find(i => i.item_id === r.itemId);
      if (!item) return null;
      return {
        a: parseFloat(item.a),
        b: parseFloat(item.b),
        c: parseFloat(item.c),
        correct: r.correct
      };
    }).filter(Boolean);

    if (scoredResponses.length === 0) {
      await db.end();
      return response.status(400).json({ error: 'No valid responses found' });
    }

    // Store responses in database
    for (const r of responses) {
      await db.sql`
        INSERT INTO assessment_responses (
          session_id, item_id, item_bank, response, correct, response_time_ms
        ) VALUES (
          ${sessionId}, ${r.itemId}, ${bankName}, ${r.response},
          ${r.correct}, ${r.responseTimeMs || null}
        )
      `;
    }

    // Estimate theta
    const priorMean = currentTheta !== null && currentTheta !== undefined
      ? parseFloat(currentTheta) : 0;
    const { theta, se } = estimateThetaEAP(scoredResponses, priorMean);

    // Calculate test information
    const info = testInfo(theta, allItems);

    // Select next items
    const exposedIds = new Set(responses.map(r => r.itemId));
    const suggestedNextItems = [];
    for (let i = 0; i < 2; i++) {
      const next = selectNextItem(allItems, theta, exposedIds);
      if (next) {
        suggestedNextItems.push(next.item_id);
        exposedIds.add(next.item_id);
      }
    }

    // Classification
    const classification = theta > 1.5 ? 'advanced'
      : theta > 0.5 ? 'proficient'
      : theta > -0.5 ? 'developing'
      : theta > -1.5 ? 'emerging'
      : 'beginning';

    // Session complete when SE is low enough or we've asked enough questions
    const sessionComplete = se < 0.4 || responses.length >= 20;

    await db.end();

    return response.status(200).json({
      theta: Math.round(theta * 100) / 100,
      thetaSE: Math.round(se * 100) / 100,
      testInfo: Math.round(info * 10) / 10,
      suggestedNextItems,
      classification,
      sessionComplete,
      confidenceInterval: [
        Math.round((theta - 1.96 * se) * 100) / 100,
        Math.round((theta + 1.96 * se) * 100) / 100
      ]
    });

  } catch (err) {
    console.error('IRT scoring error:', err);
    return response.status(500).json({ error: 'Internal server error' });
  }
}
