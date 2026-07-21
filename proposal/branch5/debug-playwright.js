const fs = require('fs');
const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2] || 'http://127.0.0.1:8001/proposal/branch2/index.html';
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const context = await browser.newContext();
  const page = await context.newPage();
  const logs = { console: [], pageErrors: [], requestFailures: [], responses: [] };

  page.on('console', msg => {
    try { logs.console.push({ type: msg.type(), text: msg.text(), location: msg.location() }); } catch(e){}
  });
  page.on('pageerror', err => logs.pageErrors.push({ message: err.message, stack: err.stack }));
  page.on('requestfailed', req => logs.requestFailures.push({ url: req.url(), method: req.method(), failure: req.failure() ? req.failure().errorText : null }));
  page.on('response', res => logs.responses.push({ url: res.url(), status: res.status(), statusText: res.statusText(), timing: res.timing ? res.timing() : null }));

  try {
    await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    // give dynamic scripts time to run
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'proposal/branch2/debug-playwright.png', fullPage: true });
    fs.writeFileSync('proposal/branch2/debug-playwright-log.json', JSON.stringify(logs, null, 2));
    console.log('OK: logs and screenshot written to proposal/branch2/');
  } catch (err) {
    console.error('ERROR in playwright run', err);
    fs.writeFileSync('proposal/branch2/debug-playwright-log.json', JSON.stringify({fatal: String(err)}, null, 2));
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
