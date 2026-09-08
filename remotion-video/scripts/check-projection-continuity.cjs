const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {projectionFor}=require('../src/perfect-map/math.ts');
const {authoredFrame}=require('../src/narration.ts');
const {Easing,interpolate}=require('remotion');
const points=[[20,15],[-35,45],[85,40],[-5,-32],[-100,40],[130,-25],[0,80],[0,-80]];
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
let endpointGap=0,lateFrameShift=0;
for(const point of points){
  const gap=distance(projectionFor(2-1e-8)(point),projectionFor(2)(point));
  endpointGap=Math.max(endpointGap,gap);assert(gap<.0001,`Endpoint jump at ${point}: ${gap}px`);
}
let previous;
for(let f=96*60;f<=97*60;f++){
  const s=authoredFrame('perfect',f)/60;
  const t=interpolate(s,[138,140],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.16,1,.3,1)});
  const projected=points.map(p=>projectionFor(1+t)(p));
  if(previous&&f>=96.5*60)for(let i=0;i<points.length;i++){const shift=distance(projected[i],previous[i]);lateFrameShift=Math.max(lateFrameShift,shift);assert(shift<2,`Late transition jumps ${shift}px at frame ${f}`);}
  previous=projected;
}
console.log(JSON.stringify({endpointGap,lateFrameShift,frames:61,landmarks:points.length}));
