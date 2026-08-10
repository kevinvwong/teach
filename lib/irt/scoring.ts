const D = 1.702;

export interface ItemParams {
  a: number;
  b: number;
  c: number;
}

export interface ScoredResponse {
  a: number;
  b: number;
  c: number;
  correct: boolean;
}

export function irt3PL(theta: number, a: number, b: number, c: number): number {
  return c + (1 - c) / (1 + Math.exp(-D * a * (theta - b)));
}

export function itemInfo(theta: number, a: number, b: number, c: number): number {
  const P = irt3PL(theta, a, b, c);
  const Q = 1 - P;
  if (P <= c || P >= 1) return 0;
  return (a * a * Q * (P - c) * (P - c)) / ((1 - c) * (1 - c) * P);
}

function logLikelihood(theta: number, responses: ScoredResponse[]): number {
  let logL = 0;
  for (const r of responses) {
    const P = irt3PL(theta, r.a, r.b, r.c);
    if (P <= 0 || P >= 1) return -Infinity;
    logL += r.correct ? Math.log(P) : Math.log(1 - P);
  }
  return logL;
}

export function estimateThetaEAP(
  responses: ScoredResponse[],
  priorMean = 0,
  priorSD = 1
): { theta: number; se: number } {
  const nQuad = 49;
  const thetaMin = -6;
  const thetaMax = 6;
  const step = (thetaMax - thetaMin) / (nQuad - 1);

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < nQuad; i++) {
    const theta = thetaMin + i * step;
    const prior = Math.exp(-0.5 * ((theta - priorMean) / priorSD) ** 2);
    const L = Math.exp(logLikelihood(theta, responses));
    numerator += theta * L * prior;
    denominator += L * prior;
  }

  const thetaEAP = denominator > 0 ? numerator / denominator : priorMean;

  let varNumerator = 0;
  for (let i = 0; i < nQuad; i++) {
    const theta = thetaMin + i * step;
    const prior = Math.exp(-0.5 * ((theta - priorMean) / priorSD) ** 2);
    const L = Math.exp(logLikelihood(theta, responses));
    varNumerator += (theta - thetaEAP) ** 2 * L * prior;
  }
  const thetaSE = denominator > 0 ? Math.sqrt(varNumerator / denominator) : priorSD;

  return { theta: thetaEAP, se: thetaSE };
}

export function selectNextItem(
  items: { id: string; a: number; b: number; c: number }[],
  theta: number,
  exposedIds: Set<string>
): { id: string; a: number; b: number; c: number } | null {
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

export function classifyTheta(theta: number): string {
  if (theta > 1.5) return "advanced";
  if (theta > 0.5) return "proficient";
  if (theta > -0.5) return "developing";
  if (theta > -1.5) return "emerging";
  return "beginning";
}
