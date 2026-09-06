export const INTRO_SECONDS = {
  start: 0, votesArrive: 0.35, votesComplete: 3.6, dissent: 4.1,
  voteExit: 7.5, projection: 8, morph: 11.3, equalEarth: 13.5,
  africa: 16, question: 21, familiarMap: 25.05, greenland: 28.4,
  comparison: 30, drag: 33, dragComplete: 35.2, ratio: 35.7,
  ratioComplete: 38.65, mercator: 39, questionMercator: 43,
  responsibility: 47.2, end: 52.1175833333,
} as const;
export const getTimestamps = (fps: number) =>
  Object.fromEntries(Object.entries(INTRO_SECONDS).map(([key, seconds]) => [key, Math.round(seconds * fps)])) as Record<keyof typeof INTRO_SECONDS, number>;
