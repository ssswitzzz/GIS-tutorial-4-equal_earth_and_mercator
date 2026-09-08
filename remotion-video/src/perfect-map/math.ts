import {geoArea, geoAzimuthalEquidistant, geoDistance, geoEquirectangular, geoGraticule, geoInterpolate, geoPath, geoProjection, geoEqualEarthRaw, geoMercatorRaw} from 'd3-geo';
import worldRaw from '../data/cas_world_land.json';
import {boundedMercatorLatitude} from '../mercator/extent';

export type Point = [number, number];
export const WORLD = {type: 'MultiPolygon' as const, coordinates: (worldRaw as Point[][]).map(ring => [geoArea({type: 'Polygon', coordinates: [ring]}) > Math.PI * 2 ? [...ring].reverse() : ring])};
export const RAD = Math.PI / 180;
export const ROUTES: [Point, Point][] = [[[0, 0], [60, 0]], [[0, 60], [60, 60]]];
export const routePoints = (route: [Point, Point], count = 80) => {
  const interpolate = geoInterpolate(...route);
  return Array.from({length: count + 1}, (_, i) => interpolate(i / count));
};
export const routeRatios = ROUTES.map(([a, b]) => Math.hypot((b[0] - a[0]) * RAD, (b[1] - a[1]) * RAD) / geoDistance(a, b));
export const MERCATOR_SCALE = (latitude: number) => 1 / Math.cos(latitude * RAD);

export const projectionFor = (mode: number) => {
  const equalMix = Math.min(1, Math.max(0, mode));
  const radialMix = Math.min(1, Math.max(0, mode - 1));
  const azimuthal = geoAzimuthalEquidistant().rotate([-20, -15]).scale(190).translate([690, 570]).clipAngle(179.5);
  if (radialMix >= 1) return azimuthal;
  return geoProjection((lambda, phi) => {
    const a = geoMercatorRaw(lambda, boundedMercatorLatitude(phi)), b = geoEqualEarthRaw(lambda, phi);
    const x = a[0] * 90 * (1 - equalMix) + b[0] * 188 * equalMix;
    const y = a[1] * 90 * (1 - equalMix) + b[1] * 188 * equalMix;
    if (radialMix === 0) return [x, y];
    const radial = azimuthal([lambda / RAD, phi / RAD])!;
    return [x * (1 - radialMix) + (radial[0] - 690) * radialMix, y * (1 - radialMix) + (570 - radial[1]) * radialMix];
  // D3 recenters raw projections around center(); converge to the target's
  // geographic center so switching to the native projection adds no offset.
  }).scale(1).center([20 * radialMix, 15 * radialMix]).translate([690, 570]).precision(.35);
};

export const graticule = geoGraticule().extent([[-180, -85], [180, 85]]).step([30, 20])();
export const flatProjection = geoEquirectangular().scale(70).translate([0, 0]);
export const landPath = (mode: number) => geoPath(projectionFor(mode))(WORLD) ?? '';
export const geodesic = (a: Point, b: Point) => ({type: 'LineString' as const, coordinates: routePoints([a, b])});

// A sphere cap flattened with radial distances fixed must stretch its circumferences.
export const capPoint = (theta: number, azimuth: number, flatten: number, radius = 270): [number, number, number] => {
  const r = radius * (Math.sin(theta) * (1 - flatten) + theta * flatten);
  return [r * Math.cos(azimuth), r * Math.sin(azimuth), radius * (Math.cos(theta) - 1) * (1 - flatten)];
};
export const capCircumferenceRatio = (theta: number) => theta / Math.sin(theta);

// A sinusoidal gore is equal-area, but not isometric; flattening its finite width changes angles.
export const gorePoint = (longitude: number, latitude: number, center: number, index: number, spread: number, radius = 195): [number, number, number] => {
  const x = radius * Math.cos(latitude) * Math.sin(longitude);
  const y = radius * Math.sin(latitude);
  const z = radius * Math.cos(latitude) * Math.cos(longitude);
  const flatX = (index - 3.5) * 179 + radius * (longitude - center) * Math.cos(latitude);
  return [x * (1 - spread) + flatX * spread, y * (1 - spread) + radius * latitude * spread, z * (1 - spread)];
};
