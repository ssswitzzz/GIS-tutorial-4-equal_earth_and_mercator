const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,file);
const {ANCHORS,CHAPTERS,chapterStart,chapterFrames,authoredFrame,TOTAL_FRAMES}=require('../src/narration.ts');
const srt=fs.readFileSync(path.resolve('../4 视频配音/4 视频配音.srt'),'utf8');
const timestamps=[...srt.matchAll(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g)].map(m=>+m[1]*3600 + +m[2]*60 + +m[3] + +m[4]/1000);
assert.equal(Math.round(Math.max(...timestamps)*60),TOTAL_FRAMES);
assert.equal(Object.keys(CHAPTERS).reduce((sum,key)=>sum+chapterFrames(key),0),TOTAL_FRAMES);
for(const [key,points] of Object.entries(ANCHORS)) {
  assert.equal(points[0][1],CHAPTERS[key][0]);
  assert.equal(points.at(-1)[1],CHAPTERS[key][1]);
  for(const [time,absolute] of points) assert(Math.abs(authoredFrame(key,Math.round(absolute*60)-chapterStart(key))-time*60)<1e-7);
  let previous=-1;
  for(let f=0;f<chapterFrames(key);f++) {const current=authoredFrame(key,f);assert(current>previous);previous=current;}
}
const modules=process.env.INTRO_QA_MODULES;
const {chromium}=require(path.join(modules,'playwright'));
const sharp=require(path.join(modules,'sharp'));
const output=path.resolve('out/narration-qa');fs.mkdirSync(output,{recursive:true});
(async()=>{
  const browser=await chromium.launch({executablePath:path.resolve('node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe'),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const errors=[],checks=[];
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    const cdp=await page.context().newCDPSession(page);
    page.on('pageerror',e=>errors.push(e.message));
    async function open(id,selector){await page.goto(`http://localhost:3004/${id}`,{waitUntil:'domcontentloaded'});await page.locator(selector).waitFor();await page.waitForFunction(()=>document.fonts.check('700 88px "Source Han Serif CN SemiBold"'));}
    async function seek(id,seconds){await page.evaluate(({id,frame})=>window.remotion_setFrame(frame,id,0),{id,frame:Math.round(seconds*60)});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
    async function inspect(id,selector,seconds){
      await seek(id,seconds);
      const issues=await page.locator(selector).evaluate(stage=>{
        const box=stage.getBoundingClientRect();
        return [...stage.querySelectorAll('[data-heading],[data-annotation],[data-math],[data-outro-label]')].filter(el=>{
          for(let p=el;p&&p!==stage;p=p.parentElement)if(+getComputedStyle(p).opacity<.05)return false;
          const r=el.getBoundingClientRect();return r.left<box.left-2||r.right>box.right+2||r.bottom>box.bottom+2||r.top<box.top-2;
        }).map(el=>el.textContent);
      });
      assert.deepEqual(issues,[],`${id}@${seconds} overflow`);assert.equal(await page.locator('.katex-error').count(),0);
      const clip=await page.locator(selector).boundingBox();assert(clip);
      const capture=await cdp.send('Page.captureScreenshot',{format:'png',clip:{...clip,scale:1},captureBeyondViewport:true});
      fs.writeFileSync(path.join(output,`${id}-${page.viewportSize().width}-${seconds}.png`),Buffer.from(capture.data,'base64'));
      console.log(`${id} ${seconds}s checked`);
      checks.push({id,seconds,viewport:page.viewportSize().width});
    }
    for(const [id,key,selector] of [['EqualEarthIntro','intro','.intro-stage'],['PerfectMapFilm','perfect','.perfect-map-stage'],['MercatorFilm','mercator','.mercator-stage'],['EqualEarthFilm','equal','.equal-earth-stage']]){
      if(process.env.QA_ONLY && key!==process.env.QA_ONLY)continue;
      await open(id,selector);
      const points=ANCHORS[key];
      for(let i=0;i<points.length-1;i++)await inspect(id,selector,(points[i][1]+points[i+1][1])/2-CHAPTERS[key][0]);
      const canvas=page.locator(`${selector} canvas`).first();
      if(await canvas.count()) {
        const seconds=key==='intro'?49:key==='perfect'?42:key==='mercator'?29:94;
        const pixels=async(s)=>{await seek(id,s);const url=await canvas.evaluate(c=>c.toDataURL());const raw=await sharp(Buffer.from(url.split(',')[1],'base64')).ensureAlpha().raw().toBuffer();assert(raw.some((v,i)=>i%4===3&&v>0));return raw;};
        const a=await pixels(seconds),b=await pixels(seconds+.5),again=await pixels(seconds);
        assert(!a.equals(b),`${id} canvas is static`);assert(a.equals(again),`${id} seek is nondeterministic`);
      }
    }
    for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
      await page.setViewportSize(viewport);await open('OutroFilm','.outro-stage');
      for(const seconds of [0,7,15,24,33,36.5,39.8])await inspect('OutroFilm','.outro-stage',seconds);
      await seek('OutroFilm',15);const a=await page.locator('.outro-stage > svg').innerHTML();
      await seek('OutroFilm',15.5);assert.notEqual(await page.locator('.outro-stage > svg').innerHTML(),a);
      await seek('OutroFilm',15);assert.equal(await page.locator('.outro-stage > svg').innerHTML(),a);
    }
    await page.setViewportSize({width:1440,height:1000});await open('FullFilm','.intro-stage');
    for(const [key,selector] of [['perfect','.perfect-map-stage'],['mercator','.mercator-stage'],['equal','.equal-earth-stage'],['outro','.outro-stage']]){
      await seek('FullFilm',chapterStart(key)/60+1);await page.locator(selector).waitFor();
      const expected=key==='outro'?'回到地图的用途':key==='equal'?'从导航屏幕':key==='mercator'?'先看它为什么诞生':'地图的数学边界';
      assert((await page.locator(selector).innerText()).includes(expected),`${key} full timeline clock offset`);
    }
    assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({TOTAL_FRAMES,checks,errors},null,2));
    console.log(JSON.stringify({frames:TOTAL_FRAMES,sceneChecks:checks.length,errors,output}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
