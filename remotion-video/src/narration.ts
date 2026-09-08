export const FPS = 60;
export const CHAPTERS = {
  intro: [0, 51.660], perfect: [51.660, 174.500],
  mercator: [174.500, 313.620], equal: [313.620, 473.740],
  outro: [473.740, 513.640],
} as const;
export type Chapter = keyof typeof CHAPTERS;
export const chapterStart = (key: Chapter) => Math.round(CHAPTERS[key][0] * FPS);
export const chapterFrames = (key: Chapter) => Math.round(CHAPTERS[key][1] * FPS) - chapterStart(key);
export const TOTAL_FRAMES = Math.round(513.640 * FPS);

// Pairs: original animation seconds, absolute narration seconds. Interior
// actions retain their choreography within each semantic narration beat.
export const ANCHORS: Record<Exclude<Chapter, 'outro'>, readonly (readonly [number, number])[]> = {
  intro: [[0,0],[3.6,3.14],[4.1,3.7],[8,7.55],[11.8,11.88],[16,15.67],[21,21.68],[25.05,25.61],[28.4,29.62],[33,33.23],[35.7,36.07],[39,40.37],[43,45],[47.2,47.45],[52.1175833333,51.66]],
  perfect: [[0,51.66],[10,57.76],[26,67.68],[35,73.91],[46,84.92],[58,92.27],[70,102.2],[86,111.6],[94,118.86],[116,134.34],[138,147.41],[162,160.63],[176,174.5]],
  mercator: [[0,174.5],[9,179.55],[23,191.98],[35,200.61],[45,210.24],[49,216.63],[61,223.07],[74,237.7],[86,243.28],[98,251.2],[115,263.18],[135,275.28],[151,281.39],[161,288.48],[170,298.78],[173,303.61],[184,313.62]],
  equal: [[0,313.62],[14,328.71],[30,340.18],[42,348.68],[53,359.1],[72,381.82],[87,395.38],[103,404.87],[120,416.18],[135,422.5],[147,429.61],[160,437.1],[171,445.06],[185,450.95],[204,461.96],[230,473.74]],
};
export const authoredFrame = (key: Exclude<Chapter, 'outro'>, frame: number): number => {
  const points = ANCHORS[key];
  const absolute = frame + chapterStart(key);
  for (let i = 1; i < points.length; i++) {
    const [a, ta] = points[i - 1], [b, tb] = points[i];
    const start = Math.round(ta * FPS), end = Math.round(tb * FPS);
    if (absolute <= end) return (a + (b - a) * Math.max(0, (absolute - start) / (end - start))) * FPS;
  }
  return points[points.length - 1][0] * FPS;
};
