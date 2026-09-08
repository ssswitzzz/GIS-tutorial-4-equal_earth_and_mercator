const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript');
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText,filename);
const {ee,xFactor,derivativeY,polarWidthRatio,ringsPoint,BEATS,E}=require('../src/equal-earth/model.ts');
for(let degree=-85;degree<=85;degree+=5){const phi=degree*Math.PI/180;assert(Math.abs(xFactor(phi)*derivativeY(phi)/Math.cos(phi)-1)<1e-7);for(const lon of [-3,-1,0,1,3]){const p=ringsPoint(lon,phi,1,1,1),q=ee(lon,phi);assert(Math.abs(p[0]-220*q[0])<1e-9);assert(Math.abs(p[1]-220*q[1])<1e-9);assert(Math.abs(p[2])<1e-12);}}
assert(polarWidthRatio>.59&&polarWidthRatio<.60);
BEATS.forEach((b,i)=>{assert(b[1]>b[0]);if(i)assert.equal(b[0],BEATS[i-1][1]);});assert.equal(E.end,230);
console.log(JSON.stringify({areaJacobian:true,latitudes:35,unfoldEndpoints:true,polarWidthRatio,duration:E.end}));
