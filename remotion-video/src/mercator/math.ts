import {geoPath, geoMercator, geoGraticule} from 'd3-geo';
import {WORLD} from '../perfect-map/math';
export const RAD = Math.PI / 180;
export const mercatorY = (latitude: number) => Math.log(Math.tan(Math.PI / 4 + latitude * RAD / 2));
export const latitudeAtY = (y: number) => (2 * Math.atan(Math.exp(y)) - Math.PI / 2) / RAD;
export const localScale = (latitude: number) => 1 / Math.cos(latitude * RAD);
export const linear = (s: number, a: number, b: number) => Math.max(0, Math.min(1, (s - a) / (b - a)));
export const SEA_VIEW = {scale:104, x:700, y:570} as const;
export const seaMap = geoMercator().scale(SEA_VIEW.scale).translate([SEA_VIEW.x, SEA_VIEW.y]).clipExtent([[SEA_VIEW.x-SEA_VIEW.scale*Math.PI, SEA_VIEW.y-SEA_VIEW.scale*Math.PI], [SEA_VIEW.x+SEA_VIEW.scale*Math.PI, SEA_VIEW.y+SEA_VIEW.scale*Math.PI]]);
export const seaLand = geoPath(seaMap)(WORLD) ?? '';
export const seaGrid = geoPath(seaMap)(geoGraticule().extent([[-180, -85], [180, 85]]).step([30, 15])()) ?? '';
export const departure: [number, number] = [-18, 28];
export const destination: [number, number] = [-59, 14];
export const rhumbPoint = (progress: number): [number, number] => [departure[0] + (destination[0] - departure[0]) * progress, latitudeAtY(mercatorY(departure[1]) + (mercatorY(destination[1]) - mercatorY(departure[1])) * progress)];
export const bearing = Math.atan2((destination[0] - departure[0]) * RAD, mercatorY(destination[1]) - mercatorY(departure[1]));
export const bearingDegrees = (bearing / RAD + 360) % 360;
export const areaGraphPoint = (latitude: number): [number, number] => [latitude * 4.4, -Math.log(localScale(latitude) ** 2) * 78];
// A decreasing cylinder curvature unrolls its surface continuously into a plane.
export const paperPoint = (lambda: number, y: number, open: number, radius = 175): [number, number, number] => {
  const curvature = 1 - open;
  if (curvature < 1e-5) return [radius * lambda, radius * y, 0];
  return [radius * Math.sin(lambda * curvature) / curvature, radius * y, radius * (Math.cos(lambda * curvature) - 1) / curvature];
};
