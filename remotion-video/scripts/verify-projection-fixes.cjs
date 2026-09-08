const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {mapProjection}=require('../src/equal-earth/model.ts');
const {geoRobinsonRaw}=require('d3-geo-projection');
const {authoredFrame,chapterStart}=require('../src/narration.ts');
for(const lon of [-140,-40,50,140])for(const lat of [-80,-40,0,40,80]){
  const projected=mapProjection(2,0,1)([lon,lat]),raw=geoRobinsonRaw(lon*Math.PI/180,lat*Math.PI/180);
  assert(Math.abs(projected[0]-(900+190*raw[0]))<1e-6);assert(Math.abs(projected[1]-(585-190*raw[1]))<1e-6);
}
for(const p of [[-42,83.5],[0,-80],[0,85],[0,-85]]){
  const [x,y]=mapProjection(0)(p);assert(x>115&&x<1775&&y>265&&y<910,`High latitude clipped: ${p}`);
}
const {chromium}=require(path.join(process.env.INTRO_QA_MODULES,'playwright'));
const sharp=require(path.join(process.env.INTRO_QA_MODULES,'sharp'));
const out=path.resolve('out/projection-fixes-qa');fs.mkdirSync(out,{recursive:true});
const focus=process.env.QA_FOCUS==='maps';
(async()=>{
  const browser=await chromium.launch({executablePath:path.resolve('node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe'),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const errors=[],results=[];
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),cdp=await page.context().newCDPSession(page);
    page.on('pageerror',e=>errors.push(e.message));
    const seek=async(id,s)=>{await page.evaluate(({id,f})=>window.remotion_setFrame(f,id,0),{id,f:Math.round(s*60)});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
    const open=async(id,selector)=>{await page.goto(`http://localhost:3004/${id}`);await page.locator(selector).waitFor();await page.waitForFunction(()=>document.fonts.check('700 88px "Source Han Serif CN SemiBold"'));};
    const shot=async(id,s,selector)=>{
      const el=page.locator(selector),clip=await el.boundingBox();assert(clip);
      const issues=await el.evaluate(stage=>{const b=stage.getBoundingClientRect();return [...stage.querySelectorAll('[data-heading],[data-annotation]')].filter(e=>{for(let p=e;p&&p!==stage;p=p.parentElement)if(+getComputedStyle(p).opacity<.05)return false;const r=e.getBoundingClientRect();return r.right>b.right+2||r.bottom>b.bottom+2||r.left<b.left-2;}).map(e=>e.textContent);});
      assert.deepEqual(issues,[]);assert.equal(await page.locator('.katex-error').count(),0);
      const capture=await cdp.send('Page.captureScreenshot',{format:'png',clip:{...clip,scale:1},captureBeyondViewport:true});fs.writeFileSync(path.join(out,`${id}-${page.viewportSize().width}-${s}.png`),Buffer.from(capture.data,'base64'));
      results.push({id,s,width:page.viewportSize().width});console.log(`${id} ${s}s passed`);
    };
    await open('EqualEarthFilm','.equal-earth-stage');
    for(const s of focus?[61]:[8,61,70,78,124,134,143,151,159.9]){
      await seek('EqualEarthFilm',s);
      const observed=Number(await page.locator('.equal-earth-stage').getAttribute('data-authored-seconds'));
      assert(Math.abs(observed-authoredFrame('equal',Math.round(s*60))/60)<1e-6,'Authored clock was clamped');
      if(s===61||s===70)assert(Math.abs(Number(await page.locator('.equal-earth-stage').getAttribute('data-robinson'))-1)<1e-6);
      if(s>=78)assert(Number(await page.locator('.equal-earth-stage').getAttribute('data-robinson'))<1e-6);
      if(s===134)assert(Number(await page.locator('[data-latitudes]').getAttribute('data-longitude-dots'))>0);
      if(s===143)assert.equal(Number(await page.locator('[data-latitudes]').getAttribute('data-longitude-dots')),247);
      if(s>=151){assert((await page.locator('[data-heading]').innerText()).includes('面积有依据'));assert.equal(await page.locator('[data-world-map]').evaluate(e=>+getComputedStyle(e.parentElement).opacity),1);}
      await shot('EqualEarthFilm',s,'.equal-earth-stage');
    }
    const pixels=async(s)=>{await seek('EqualEarthFilm',s);const data=await page.locator('[data-latitudes]').evaluate(c=>c.toDataURL());const raw=await sharp(Buffer.from(data.split(',')[1],'base64')).ensureAlpha().raw().toBuffer();assert(raw.some((v,i)=>i%4===3&&v));return raw;};
    for(const s of focus?[]:[134,140]){const a=await pixels(s),b=await pixels(s+.5),again=await pixels(s);assert(!a.equals(b),'Late canvas is static');assert(a.equals(again),'Seek is not deterministic');}
    await page.setViewportSize({width:390,height:844});
    for(const s of focus?[61]:[61,143,159.9]){await seek('EqualEarthFilm',s);await shot('EqualEarthFilm',s,'.equal-earth-stage');}
    await page.setViewportSize({width:1440,height:1000});
    const maps=[['PerfectMapFilm','.perfect-map-stage',80,'保局部角度'],['MercatorFilm','.mercator-stage',46,'沿经线切开']];
    for(const [id,selector,s,expected] of focus?maps:[...maps,['PerfectMapFilm','.perfect-map-stage',121,'不存在完美'],['MercatorFilm','.mercator-stage',138,'看清局部方向'],['EqualEarthIntro','.intro-stage',29,'差不多大'],['OutroFilm','.outro-stage',7,'各有所长']]){
      await open(id,selector);await seek(id,s);assert((await page.locator(selector).innerText()).includes(expected));await shot(id,s,selector);
    }
    await open('FullFilm','.intro-stage');
    await seek('FullFilm',(chapterStart('equal')+Math.round(159*60))/60);
    assert(Math.abs(Number(await page.locator('.equal-earth-stage').getAttribute('data-authored-seconds'))-authoredFrame('equal',159*60)/60)<1e-6);
    assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({results,errors},null,2));console.log(JSON.stringify({checks:results.length,errors,out}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
