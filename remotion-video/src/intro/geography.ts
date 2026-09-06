import {geoArea, geoEqualEarthRaw, geoMercatorRaw, geoProjection, geoGraticule, geoAzimuthalEqualArea, geoMercator, geoPath, geoRotation} from 'd3-geo';
import worldRaw from '../data/cas_world_land.json';
import africaRaw from '../data/cas_africa.json';
import greenlandRaw from '../data/cas_greenland.json';
type Point = [number, number];
type Rings = Point[][];
export const world = worldRaw as Rings;
export const africa = africaRaw as Rings;
export const greenland = greenlandRaw as Rings;
// One source polygon has reversed winding; D3 otherwise fills the entire globe around it.
const geometry = (rings: Rings) => ({type: 'MultiPolygon' as const, coordinates: rings.map(ring => [geoArea({type: 'Polygon', coordinates: [ring]}) > Math.PI * 2 ? [...ring].reverse() : ring])});
export const mercator = geoMercator().scale(165).translate([1020, 745]);
const bounded = ([lon, lat]: Point): Point => [lon, Math.max(-60, Math.min(84, lat))];
const project = (point: Point): Point => mercator(bounded(point)) as Point;
const round = (n: number) => Math.round(n * 100) / 100;
const prepared = {world: geometry(world), africa: geometry(africa), greenland: geometry(greenland)};
// D3's geographic stream clips the antimeridian and resamples curves before drawing.
const morphProjection = (morph: number) => geoProjection((lambda, phi) => {
  const latitude = Math.max(-Math.PI / 3, Math.min(84 * Math.PI / 180, phi));
  const a = geoMercatorRaw(lambda, latitude), b = geoEqualEarthRaw(lambda, latitude);
  return [a[0] * 165 * (1 - morph) + b[0] * 245 * morph, a[1] * 165 * (1 - morph) + b[1] * 245 * morph];
}).scale(1).translate([1020, 745 - 95 * morph]).precision(.4);
const pathCache = new Map<string, string>();
export const mapPath = (name: keyof typeof prepared, morph: number) => {
  const key = `${name}:${morph}`;
  if (pathCache.has(key)) return pathCache.get(key)!;
  const path = geoPath(morphProjection(morph))(prepared[name]) ?? '';
  if (morph === 0 || morph === 1) pathCache.set(key, path);
  return path;
};
const grid = geoGraticule().extent([[-180, -60], [180, 84]]).step([30, 20])();
export const gridPath = (morph: number) => geoPath(morphProjection(morph))(grid) ?? '';
export const transportedGreenland = (progress: number) => {
  const rotation = geoRotation([42 * progress, -65 * progress, 0]);
  return greenland.map(ring => ring.map((point, i) => {
    const p = rotation(point); p[0] += 18 * progress;
    const xy = project(p);
    return `${i ? 'L' : 'M'}${round(xy[0])},${round(xy[1])}`;
  }).join('') + 'Z').join('');
};
const africaProjection = geoAzimuthalEqualArea().rotate([-20, 0]).fitExtent([[355, 270], [885, 885]], geometry(africa));
export const africaPlate = geoPath(africaProjection)(geometry(africa))!;
const islandProjection = geoAzimuthalEqualArea().rotate([42, -72]).scale(africaProjection.scale()).translate([0, 0]);
const islandBounds = geoPath(islandProjection).bounds(geometry(greenland));
islandProjection.translate([-(islandBounds[0][0] + islandBounds[1][0]) / 2, -(islandBounds[0][1] + islandBounds[1][1]) / 2]);
export const islandPlate = geoPath(islandProjection)(geometry(greenland))!;
export const areaRatio = geoArea(geometry(africa)) / geoArea(geometry(greenland));
export const islandPositions = Array.from({length: 14}, (_, i) => ({x: 1080 + (i % 5) * 145, y: 380 + Math.floor(i / 5) * 190}));
