const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const runtimeModules = process.env.INTRO_QA_MODULES;
const load = name => require(runtimeModules ? path.join(runtimeModules, name) : name);
const {chromium} = load('playwright');
const sharp = load('sharp');
const output = path.resolve('out/intro-qa');
fs.mkdirSync(output, {recursive: true});

async function main() {
  const browser = await chromium.launch({
    executablePath: path.resolve('node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe'),
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const errors = [];
  const results = [];
  try {
    for (const viewport of [{width: 1440, height: 1000}, {width: 390, height: 844}]) {
      const page = await browser.newPage({viewport});
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://localhost:3001/EqualEarthIntro');
      await page.locator('.intro-stage').waitFor();
      await page.waitForFunction(() => document.fonts.check('700 88px "Source Han Serif CN SemiBold"'));
      const seek = async frame => {
        await page.evaluate(frame => window.remotion_setFrame(frame, 'EqualEarthIntro', 0), frame);
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      };
      for (const frame of viewport.width > 1000 ? [0, 300, 480, 840, 1080, 1440, 1800, 2010, 2100, 2210, 2334, 2400, 2640, 2820, 2940, 3060, 3127] : [1800, 2940]) {
        await seek(frame);
        const state = await page.evaluate(() => {
          const stage = document.querySelector('.intro-stage');
          const bounds = stage.getBoundingClientRect();
          const overflow = Array.from(stage.querySelectorAll('div')).filter(element => {
            if (!element.textContent || element.children.length) return false;
            for (let parent = element; parent && parent !== stage; parent = parent.parentElement) {
              if (Number(getComputedStyle(parent).opacity) < .05) return false;
            }
            const box = element.getBoundingClientRect();
            return box.right > bounds.right + 2 || box.left < bounds.left - 2 || box.bottom > bounds.bottom + 2;
          }).map(element => element.textContent);
          return {width: bounds.width, height: bounds.height, overflow};
        });
        assert(state.width > 0 && state.height > 0, 'The composition must be visible');
        assert.deepEqual(state.overflow, [], `Text overflow at frame ${frame}`);
        if ([0, 300, 840, 1800, 2100, 2334, 2940].includes(frame)) await page.locator('.intro-stage').screenshot({path: path.join(output, `${viewport.width}-${frame}.png`)});
        results.push({viewport: viewport.width, frame, textFits: true});
      }
      const pixelsAt = async frame => {
        await seek(frame);
        const data = await page.locator('canvas[aria-label="旋转地球"]').evaluate(canvas => canvas.toDataURL('image/png'));
        const pixels = await sharp(Buffer.from(data.split(',')[1], 'base64')).raw().toBuffer();
        let visible = 0;
        for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 0) visible++;
        assert(visible > 100000, 'The WebGL globe must contain visible pixels');
        return {visible, hash: crypto.createHash('sha256').update(pixels).digest('hex')};
      };
      const first = await pixelsAt(2940), next = await pixelsAt(3000), repeated = await pixelsAt(2940);
      assert.notEqual(first.hash, next.hash, 'The globe must move between frames');
      assert.equal(first.hash, repeated.hash, 'Seeking back must reproduce the same frame');
      results.push({viewport: viewport.width, globePixels: first.visible, globeMoves: true, deterministic: true});
      await page.close();
    }
    assert.deepEqual(errors, [], 'Browser runtime errors');
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
    console.log(JSON.stringify({checks: results.length, browserErrors: errors.length, screenshotDirectory: output}, null, 2));
  } finally {
    await browser.close();
  }
}
main().catch(error => {console.error(error); process.exitCode = 1;});
