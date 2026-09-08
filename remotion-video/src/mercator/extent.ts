export const MERCATOR_LIMIT = 85.0511287798066;
export const boundedMercatorLatitude = (phi: number) => Math.max(-MERCATOR_LIMIT * Math.PI / 180, Math.min(MERCATOR_LIMIT * Math.PI / 180, phi));
