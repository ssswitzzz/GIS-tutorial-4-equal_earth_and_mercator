const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const modules = process.env.INTRO_QA_MODULES;
const load = name => require(modules ? path.join(modules, name) : name);
const {chromium} = load('playwright');
const sharp = load('sharp');
const output = path.resolve('out/perfect-map-qa');
fs.mkdirSync(output, {recursive: true});
(async () => {
  const browser = await chromium.launch({executablePath: path.resolve('node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe'), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
  const errors = [], results = [];
  try {
    for (const viewport of [{width: 1440, height: 1000}, {width: 390, height: 844}]) {
      const page = await browser.newPage({viewport}); page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://localhost:3001/PerfectMapFilm'); await page.locator('.perfect-map-stage').waitFor();
      await page.waitForFunction(() => document.fonts.check('700 88px "Source Han Serif CN SemiBold"'));
      const seek = async seconds => {await page.evaluate(frame => window.remotion_setFrame(frame, 'PerfectMapFilm', 0), Math.round(seconds * 60)); await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));};
      for (const seconds of viewport.width > 1000 ? [0, 8, 20, 24, 32, 40, 52, 64, 73, 79, 84, 90, 105, 114, 125, 135, 145, 156, 168, 175] : [64, 84, 114, 156, 175]) {
        await seek(seconds);
        const issues = await page.evaluate(() => {
          const stage = document.querySelector('.perfect-map-stage'), box = stage.getBoundingClientRect();
          return Array.from(stage.querySelectorAll('[data-heading], [data-annotation], [data-math]')).filter(e => {
            for (let p = e; p && p !== stage; p = p.parentElement) if (Number(getComputedStyle(p).opacity) < .05) return false;
            const r = e.getBoundingClientRect(); return r.left < box.left - 2 || r.right > box.right + 2 || r.bottom > box.bottom + 2;
          }).map(e => e.textContent);
        });
        assert.deepEqual(issues, [], `Overflow at ${seconds}s`);
        assert.equal(await page.locator('.katex-error').count(), 0);
        await page.locator('.perfect-map-stage').screenshot({path: path.join(output, `${viewport.width}-${seconds}.png`)});
        results.push({viewport: viewport.width, seconds, textFits: true});
      }
      const pixel = async seconds => {await seek(seconds); const data = await page.locator('[data-geometry]').evaluate(c => c.toDataURL()); const p = await sharp(Buffer.from(data.split(',')[1], 'base64')).raw().toBuffer(); let visible = 0; for (let i = 3; i < p.length; i += 4) if (p[i] > 0) visible++; assert(visible > 100000); return crypto.createHash('sha256').update(p).digest('hex');};
      for (const seconds of [20, 63, 80, 169]) {const a = await pixel(seconds), b = await pixel(seconds + 1), again = await pixel(seconds); assert.notEqual(a, b); assert.equal(a, again); results.push({viewport: viewport.width, seconds, canvasMoves: true, deterministic: true});}
      await page.close();
    }
    assert.deepEqual(errors, []); fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
    console.log(JSON.stringify({checks: results.length, errors, output}));
  } finally {await browser.close();}
})().catch(error => {console.error(error); process.exitCode = 1;});
