const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {WORLD}=require('../src/perfect-map/math.ts'),{geoContains}=require('d3-geo'),math=require('../src/mercator/math.ts');
for(let i=0;i<=1000;i++)assert(!geoContains(WORLD,math.rhumbPoint(i/1000)),`Route crosses land at ${i}`);
const {neighborhoodBlock}=require('../src/mercator/neighborhood.ts');
const block=neighborhoodBlock(387,721,1);const a=block[1].map((v,i)=>v-block[0][i]),b=block[3].map((v,i)=>v-block[0][i]);assert(Math.abs(a[0]*b[0]+a[1]*b[1])>100);
for(let lat=60;lat<=85;lat+=.1)assert(math.areaGraphPoint(lat).every(Number.isFinite));
const {chromium}=require(path.join(process.env.INTRO_QA_MODULES,'playwright')),sharp=require(path.join(process.env.INTRO_QA_MODULES,'sharp'));
const out=path.resolve('out/mercator-revision-qa');fs.mkdirSync(out,{recursive:true});
(async()=>{
  const browser=await chromium.launch({executablePath:path.resolve('node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe'),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const errors=[];
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),cdp=await page.context().newCDPSession(page);
    page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:3004/MercatorFilm');await page.locator('.mercator-stage').waitFor();await page.waitForFunction(()=>document.fonts.check('700 88px "Source Han Serif CN SemiBold"'));
    const seek=async s=>{await page.evaluate(f=>window.remotion_setFrame(f,'MercatorFilm',0),Math.round(s*60));await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
    for(const width of [1440,390]){
      await page.setViewportSize({width,height:width===1440?1000:844});
      const samples=process.env.QA_HANDOFF ? (width===1440?[45,46,47,47.5,48,49,51,63,77,92]:[47.5,51,77]) : (width===1440?[10,18,18.5,20,28,32,37,40,92,105,106.5,110,131,136,138]:[28,92,105,138]);
      for(const s of samples){
        await seek(s);
        if(s>=105&&s<=110){const gap=await page.evaluate(()=>{const p=document.querySelector('[data-area-curve]'),c=document.querySelector('[data-area-tip]'),end=p.getPointAtLength(p.getTotalLength());return Math.hypot(end.x-c.cx.baseVal.value,end.y-c.cy.baseVal.value);});assert(gap<.01,`Curve-tip gap ${gap}`);}
        if(s===138)assert(Number(await page.locator('[data-neighborhood]').getAttribute('data-deformation'))>.99);
        const issues=await page.locator('.mercator-stage').evaluate(stage=>{const b=stage.getBoundingClientRect();return [...stage.querySelectorAll('[data-heading],[data-annotation],[data-math]')].filter(e=>{for(let p=e;p&&p!==stage;p=p.parentElement)if(+getComputedStyle(p).opacity<.05)return false;const r=e.getBoundingClientRect();return r.left<b.left-2||r.right>b.right+2||r.bottom>b.bottom+2;}).map(e=>e.textContent);});assert.deepEqual(issues,[]);assert.equal(await page.locator('.katex-error').count(),0);
        const clip=await page.locator('.mercator-stage').boundingBox(),shot=await cdp.send('Page.captureScreenshot',{format:'png',clip:{...clip,scale:1},captureBeyondViewport:true});fs.writeFileSync(path.join(out,`${width}-${s}.png`),Buffer.from(shot.data,'base64'));console.log(`${width} ${s}s passed`);
      }
    }
    const pixels=async s=>{await seek(s);const url=await page.locator('[data-cylinder]').evaluate(c=>c.toDataURL());const raw=await sharp(Buffer.from(url.split(',')[1],'base64')).ensureAlpha().raw().toBuffer();assert(raw.some((v,i)=>i%4===3&&v));return raw;};
    for(const s of [18,28,37]){const a=await pixels(s),b=await pixels(s+.5),again=await pixels(s);assert(!a.equals(b));assert(a.equals(again));}
    assert.deepEqual(errors,[]);console.log(JSON.stringify({frames:process.env.QA_HANDOFF?13:19,routeOceanSamples:1001,canvasMotion:true,errors,out}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
