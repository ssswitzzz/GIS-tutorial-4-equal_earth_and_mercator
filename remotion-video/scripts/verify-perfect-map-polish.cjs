const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.INTRO_QA_MODULES,'playwright'));
const out=path.resolve('out/perfect-map-polish-qa');fs.mkdirSync(out,{recursive:true});
(async()=>{
  const browser=await chromium.launch({executablePath:path.resolve('node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe'),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const errors=[];
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),cdp=await page.context().newCDPSession(page);
    page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:3004/PerfectMapFilm');await page.locator('.perfect-map-stage').waitFor();
    await page.waitForFunction(()=>document.fonts.check('700 88px "Source Han Serif CN SemiBold"'));
    const seek=async s=>{await page.evaluate(f=>window.remotion_setFrame(f,'PerfectMapFilm',0),Math.round(s*60));await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
    for(const width of [1440,390]){
      await page.setViewportSize({width,height:width===1440?1000:844});
      const samples=process.env.QA_TRANSITION ? (width===1440?[96,96.5,96.85,97]:[96.85,97]) : (width===1440?[61,64,66.8,68,100,105,110]:[64,100,105]);
      for(const s of samples){
        await seek(s);
        if(s===64){assert.equal(await page.locator('[data-choice-card]').count(),3);assert.equal(await page.locator('[data-projection-lab]').count(),0);}
        if(s>=68){assert.equal(await page.locator('[data-projection-choices]').count(),0);assert.equal(await page.locator('[data-projection-lab]').count(),1);}
        if(s>=100)assert.equal(await page.locator('[data-distance-routes]').count(),1);
        const issues=await page.locator('.perfect-map-stage').evaluate(stage=>{
          const b=stage.getBoundingClientRect();return [...stage.querySelectorAll('[data-choice-card],[data-heading],[data-math]')].filter(e=>{for(let p=e;p&&p!==stage;p=p.parentElement)if(+getComputedStyle(p).opacity<.05)return false;const r=e.getBoundingClientRect();return r.left<b.left-2||r.right>b.right+2||r.bottom>b.bottom+2;}).map(e=>e.textContent);
        });assert.deepEqual(issues,[]);assert.equal(await page.locator('.katex-error').count(),0);
        const clip=await page.locator('.perfect-map-stage').boundingBox(),shot=await cdp.send('Page.captureScreenshot',{format:'png',clip:{...clip,scale:1},captureBeyondViewport:true});fs.writeFileSync(path.join(out,`${width}-${s}.png`),Buffer.from(shot.data,'base64'));console.log(`${width} ${s}s passed`);
      }
    }
    for(const [s,selector] of [[64,'[data-projection-choices]'],[99,'[data-distance-routes]']]){await seek(s);const a=await page.locator(selector).innerHTML();await seek(s+.5);assert.notEqual(await page.locator(selector).innerHTML(),a);await seek(s);assert.equal(await page.locator(selector).innerHTML(),a);}
    assert.deepEqual(errors,[]);console.log(JSON.stringify({frames:process.env.QA_TRANSITION?6:10,deterministicMotion:true,errors,out}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
