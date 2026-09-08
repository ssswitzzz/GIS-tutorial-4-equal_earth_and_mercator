import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {geoArea, geoPath, geoMercator, geoEqualEarth, geoGraticule} from 'd3-geo';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.resolve(root, '../cover');
fs.mkdirSync(out, {recursive: true});
const geometry = (name) => ({type: 'MultiPolygon', coordinates: JSON.parse(fs.readFileSync(path.join(root, `src/data/cas_${name}.json`), 'utf8')).map(ring => [geoArea({type: 'Polygon', coordinates: [ring]}) > 2 * Math.PI ? [...ring].reverse() : ring])});
const world = geometry('world_land');
const africa = geometry('africa');
const greenland = geometry('greenland');
const ink = '#193d3d';
const coral = '#cb4d40';
const gold = '#edbd54';
const grid = geoGraticule().extent([[-180,-85],[180,85]]).step([30,15])();
const mercator = geoMercator().scale(87).translate([460,650]).clipExtent([[185,376],[735,924]]);
const equal = geoEqualEarth().scale(173).translate([1320,647]);
function map(name, projection, ocean) {
  const p = geoPath(projection).digits(2);
  return `<g id="${name}">
    ${ocean}
    <path id="${name}-land" d="${p(world)}" fill="#73958a" stroke="#f5f5ed" stroke-width="1.2"/>
    <path id="${name}-graticule" d="${p(grid)}" fill="none" stroke="${ink}" stroke-opacity="0.18" stroke-width="1"/>
    <path id="${name}-africa" d="${p(africa)}" fill="${gold}" stroke="${ink}" stroke-width="1.8"/>
    <path id="${name}-greenland" d="${p(greenland)}" fill="${coral}" stroke="${ink}" stroke-width="1.8"/>
  </g>`;
}
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <title>世界地图，画错了？</title>
  <desc>墨卡托和平等地球投影对照。黄色为非洲，红色为格陵兰岛。地图使用真实地理数据，墨卡托显示至约南北纬85度。文字保留可编辑状态。</desc>
  <g id="background">
    <rect width="1920" height="1080" fill="#f5f5ed"/>
    <path d="M0 0H1920V22H0Z" fill="${ink}"/>
    <path d="M78 306H1842" stroke="${ink}" stroke-width="2"/>
    <path d="M78 1018H1842" stroke="${ink}" stroke-opacity="0.3"/>
  </g>
  <g id="headline" font-family="Source Han Serif CN" font-weight="600" fill="${ink}">
    <text x="78" y="112" font-size="33">从墨卡托，到平等地球</text>
    <text x="70" y="259" font-size="132">世界地图，<tspan fill="${coral}">画错了？</tspan></text>
  </g>
  ${map('mercator', mercator, '<rect x="185" y="376" width="550" height="548" fill="#e3e9e3" stroke="#193d3d" stroke-width="2"/>')}
  ${map('equal-earth', equal, `<path d="${geoPath(equal)({type:'Sphere'})}" fill="#e3e9e3" stroke="${ink}" stroke-width="2"/>`)}
  <g id="comparison-arrow" fill="none" stroke="${coral}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M785 644H864M845 624L865 644L845 664"/>
  </g>
  <g id="labels" font-family="Source Han Serif CN" font-weight="600" fill="${ink}" text-anchor="middle">
    <text x="460" y="977" font-size="40">墨卡托投影</text>
    <text x="1320" y="977" font-size="40">平等地球投影</text>
    <text x="1320" y="374" font-size="44">同一个地球，不一样的大小</text>
  </g>
  <g id="legend" transform="translate(0 50)" font-family="Source Han Serif CN" font-weight="600" font-size="27" fill="${ink}">
    <rect x="1158" y="853" width="24" height="24" fill="${gold}"/>
    <text x="1196" y="877">非洲</text>
    <rect x="1330" y="853" width="24" height="24" fill="${coral}"/>
    <text x="1368" y="877">格陵兰岛</text>
  </g>
</svg>`;
fs.writeFileSync(path.join(out, 'world-map-cover.svg'), svg);
const font = fs.readFileSync(path.join(root, 'public/fonts/SourceHanSerifCN-SemiBold.otf')).toString('base64');
fs.writeFileSync(path.join(out, 'preview.html'), `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>世界地图 · 视频封面</title><style>@font-face{font-family:'Source Han Serif CN';src:url(data:font/otf;base64,${font})}html,body{margin:0;background:#dadfdc}svg{display:block;width:100%;height:auto}</style>${svg.replace(/<\?xml[^>]*>/,'')}</html>`);
console.log(path.join(out, 'world-map-cover.svg'));
