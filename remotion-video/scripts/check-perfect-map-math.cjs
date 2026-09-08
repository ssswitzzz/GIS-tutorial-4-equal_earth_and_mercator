const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022}}).outputText, filename);
const {geoDistance, geoPath, geoCircle} = require('d3-geo');
const math = require('../src/perfect-map/math.ts');
const {NARRATION, getPerfectMapTimestamps} = require('../src/perfect-map/timing.ts');
assert(Math.abs(math.routeRatios[0] - 1) < 1e-10);
assert(math.routeRatios[1] > 2);
assert(Math.abs(math.MERCATOR_SCALE(60) - 2) < 1e-10);
assert(math.capCircumferenceRatio(.95) > 1);
const origin = [20, 15], projection = math.projectionFor(2), center = projection(origin);
for (const point of [[-35, 45], [85, 40], [-20, -35], [70, -40]]) {
  const p = projection(point);
  assert(Math.abs(Math.hypot(p[0] - center[0], p[1] - center[1]) - 190 * geoDistance(origin, point)) < 1e-7);
}
const areas = [-45, 0, 45].map(lat => geoPath(math.projectionFor(1)).area(geoCircle().center([0, lat]).radius(4.5).precision(1)()));
assert(Math.max(...areas) / Math.min(...areas) < 1.002);
for (const flat of [0, .25, .5, .75, 1]) for (let i = 0; i <= 10; i++) {
  assert(math.capPoint(.95 * i / 10, i, flat).every(Number.isFinite));
  assert(math.gorePoint(.3, -.8 + i * .16, .1, 4, flat).every(Number.isFinite));
}
NARRATION.forEach((beat, i) => {assert(beat.end > beat.start); if (i) assert.equal(beat.start, NARRATION[i - 1].end);});
assert.equal(getPerfectMapTimestamps(60).end, 10560);
console.log(JSON.stringify({routeScaleRatios: math.routeRatios,mercatorAreaScaleAt60: math.MERCATOR_SCALE(60) ** 2, equalAreaCircleSpread: Math.max(...areas) / Math.min(...areas), radialDistancePreserved: true, durationSeconds: 176}, null, 2));
