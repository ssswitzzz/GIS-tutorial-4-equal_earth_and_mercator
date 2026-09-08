const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022}}).outputText, filename);
const m = require('../src/mercator/math.ts');
const {MERCATOR_BEATS, mercatorFrames} = require('../src/mercator/timing.ts');
for (const lat of [-80,-60,-15,0,15,60,80]) {
  assert(Math.abs(m.latitudeAtY(m.mercatorY(lat)) - lat) < 1e-10);
  const derivative = (m.mercatorY(lat + 1e-4) - m.mercatorY(lat - 1e-4)) / (2e-4 * m.RAD);
  assert(Math.abs(derivative - m.localScale(lat)) < 1e-7);
}
for(let i=0;i<100;i++) {
  const a=m.rhumbPoint(i/100), b=m.rhumbPoint((i+1)/100);
  const bearing=Math.atan2((b[0]-a[0])*m.RAD,m.mercatorY(b[1])-m.mercatorY(a[1]));
  assert(Math.abs(bearing-m.bearing)<1e-10);
}
for(const open of [0,.2,.5,.9,1]) for(const longitude of [-2,-1,0,1,2]) {
  const a=m.paperPoint(longitude-1e-5,.3,open), b=m.paperPoint(longitude+1e-5,.3,open);
  assert(Math.abs(Math.hypot(...a.map((v,i)=>b[i]-v))/(2e-5)-175)<1e-5);
}
MERCATOR_BEATS.forEach((beat,i)=>{assert(beat.end>beat.start);if(i)assert.equal(beat.start,MERCATOR_BEATS[i-1].end);});
assert.equal(mercatorFrames(60).end,11040);
assert(m.mercatorY(89.999)>m.mercatorY(89));
assert(m.mercatorY(-89.999)<m.mercatorY(-89));
for(const lat of [0,45,70]) {
  const lon=.4, y=m.mercatorY(lat), radius=175;
  const cylinder=m.paperPoint(lon,y,0);
  assert(Math.abs(Math.hypot(cylinder[0],cylinder[2]+radius)-radius)<1e-9);
  const flat=m.paperPoint(lon,y,1);
  assert(Math.abs(flat[0]-radius*lon)<1e-9);
  assert(Math.abs(flat[1]-radius*y)<1e-9);
}
assert(Math.abs(m.localScale(45)**2-2)<1e-12);
assert(Math.abs(m.localScale(70)**2-8.54863217041303)<1e-10);
for(const lat of [-80,0,80])for(const lon of [-170,0,170]){
  const p=m.paperPoint(lon*m.RAD,m.mercatorY(lat),1);
  const screen=[m.SEA_VIEW.x+p[0]*m.SEA_VIEW.scale/175,m.SEA_VIEW.y-p[1]*m.SEA_VIEW.scale/175];
  const target=m.seaMap([lon,lat]);assert(Math.hypot(screen[0]-target[0],screen[1]-target[1])<1e-8,'Unfolded paper must align with the SVG map');
}
console.log(JSON.stringify({duration:184, bearingDegrees:m.bearing/m.RAD, conformalDerivative:true, cylinderIsometry:true, rhumbSamples:100, poles:true}));
