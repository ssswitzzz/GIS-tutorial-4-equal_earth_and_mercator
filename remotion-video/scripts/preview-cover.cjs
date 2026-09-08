const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require('C:/Users/12907/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const root = path.resolve(__dirname, '..');
  const browser = await chromium.launch({executablePath: path.join(root, 'node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe'), headless: true});
  try {
    const page = await browser.newPage({viewport: {width: 1920, height: 1080}, deviceScaleFactor: 1});
    await page.goto(pathToFileURL(path.resolve(root, '../cover/preview.html')).href);
    await page.evaluate(() => document.fonts.ready);
    const overflow = await page.locator('svg text').evaluateAll(nodes => nodes.filter(node => {const b = node.getBBox(); return b.x < 0 || b.y < 0 || b.x + b.width > 1920 || b.y + b.height > 1080;}).map(node => node.textContent));
    if (overflow.length) throw new Error(JSON.stringify(overflow));
    await page.screenshot({path: path.resolve(root, '../cover/world-map-cover.png')});
    console.log('Cover preview saved; all text fits the artboard.');
  } finally {await browser.close();}
})();
