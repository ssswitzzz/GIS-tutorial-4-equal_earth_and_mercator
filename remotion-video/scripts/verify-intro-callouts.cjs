const path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.INTRO_QA_MODULES,'playwright'));
const out=path.resolve('out/intro-callouts-qa');fs.mkdirSync(out,{recursive:true});
(async()=>{
  const browser=await chromium.launch({executablePath:path.resolve('node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe'),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const errors=[];
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),cdp=await page.context().newCDPSession(page);
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://localhost:3004/EqualEarthIntro');await page.locator('.intro-stage').waitFor();
    await page.waitForFunction(()=>document.fonts.check('700 88px "Source Han Serif CN SemiBold"'));
    const seek=async s=>{await page.evaluate(f=>window.remotion_setFrame(f,'EqualEarthIntro',0),Math.round(s*60));await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
    for(const s of [18,21.7,24,25,25.5,26,30.5,31,32,32.7,33.3]){
      await seek(s);
      if(s>=21.7&&s<=26||s>=33.3)assert.equal(await page.locator('[data-callout]').count(),0,`Labels reappeared at ${s}s`);
      if(s===32)assert.equal(await page.locator('[data-callout]').count(),2);
      const targets=await page.locator('[data-callout]').evaluateAll(labels=>labels.map(label=>{
        const name=label.getAttribute('data-callout'),dot=label.querySelector('circle'),land=document.querySelector(`[data-land="${name}"]`);
        const screen=new DOMPoint(dot.cx.baseVal.value,dot.cy.baseVal.value).matrixTransform(dot.getScreenCTM());
        const point=screen.matrixTransform(land.getScreenCTM().inverse());
        const bounds=label.querySelector('text').getBoundingClientRect(),stage=document.querySelector('.intro-stage').getBoundingClientRect();
        return {name,inside:land.isPointInFill(point),fits:bounds.left>=stage.left&&bounds.right<=stage.right&&bounds.top>=stage.top&&bounds.bottom<=stage.bottom};
      }));
      for(const target of targets){assert(target.inside,`${target.name} missed at ${s}s`);assert(target.fits);}
      if([24,25,32].includes(s)){
        const clip=await page.locator('.intro-stage').boundingBox(),shot=await cdp.send('Page.captureScreenshot',{format:'png',clip:{...clip,scale:1},captureBeyondViewport:true});fs.writeFileSync(path.join(out,`${s}.png`),Buffer.from(shot.data,'base64'));
      }
      console.log(`${s}s passed`);
    }
    await page.setViewportSize({width:390,height:844});await seek(32);
    const clip=await page.locator('.intro-stage').boundingBox(),shot=await cdp.send('Page.captureScreenshot',{format:'png',clip:{...clip,scale:1},captureBeyondViewport:true});fs.writeFileSync(path.join(out,'mobile-32.png'),Buffer.from(shot.data,'base64'));
    assert.deepEqual(errors,[]);console.log(JSON.stringify({checks:11,errors,out}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
