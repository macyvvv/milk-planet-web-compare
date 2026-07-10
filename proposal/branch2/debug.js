const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const logs = [];
  const errors = [];
  const networkRequests = [];
  
  // キャプチャ：コンソールメッセージ
  page.on('console', msg => {
    logs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });
  
  // キャプチャ：ページエラー
  page.on('pageerror', err => {
    errors.push({
      message: err.message,
      stack: err.stack?.split('\n').slice(0, 5).join('\n')
    });
  });
  
  // キャプチャ：ネットワークリクエスト
  page.on('request', req => {
    if (req.resourceType() === 'script' || req.resourceType() === 'stylesheet') {
      networkRequests.push({
        url: req.url(),
        type: req.resourceType(),
        method: req.method()
      });
    }
  });
  
  console.log('=== Navigating to branch2 ===');
  try {
    await page.goto('http://127.0.0.1:8001/proposal/branch2/index.html', { waitUntil: 'networkidle' });
  } catch (e) {
    console.error('Navigation error:', e.message);
  }
  
  // Wait for potential DOM updates
  await page.waitForTimeout(3000);
  
  // スクリーンショット
  console.log('=== Taking screenshot ===');
  await page.screenshot({ path: 'proposal/branch2/debug-screenshot.png' });
  
  // DOM state
  console.log('=== Checking DOM state ===');
  const domState = await page.evaluate(() => {
    return {
      eventSliderExists: !!document.getElementById('eventslider'),
      eventSliderHTML: document.getElementById('eventslider')?.innerHTML?.length || 0,
      slickInitialized: !!(window.jQuery && window.jQuery.fn.slick),
      swiperInitialized: !!window.Swiper,
      aosInitialized: !!window.AOS,
      jqueryLoaded: !!window.jQuery,
      modaalLoaded: !!window.jQuery?.fn?.modaal
    };
  });
  
  console.log('\n=== RESULTS ===');
  console.log('Logs:', JSON.stringify(logs, null, 2));
  console.log('\nErrors:', JSON.stringify(errors, null, 2));
  console.log('\nNetwork Requests:', JSON.stringify(networkRequests, null, 2));
  console.log('\nDOM State:', JSON.stringify(domState, null, 2));
  
  await browser.close();
})();
