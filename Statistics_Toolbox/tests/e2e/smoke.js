// Browser smoke test: opens every tool, loads sample data, presses Calculate and fails on any script error.
// Needs Playwright (not a dependency of the app): npm i -D playwright && npx playwright install chromium
// Usage: node tests/e2e/smoke.js   (set CHROMIUM=/path/to/chromium to use an existing browser)
const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const file = process.argv[2] || path.join(__dirname, '..', '..', 'Statistics.html');
  const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => { if (!/Chart is not defined/.test(e.message)) errs.push('PAGEERROR ' + e.message); });  // Chart.js comes from a CDN
  p.on('console', m => { if (m.type() === 'error' && !/fonts|chart\.umd|net::ERR/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('file://' + file);
  const tabs = await p.$$eval('.tab', t => t.map(x => x.dataset.tab));
  let n = 0;
  for (const t of tabs) {
    await p.click(`.tab[data-tab="${t}"]`);
    const stats = await p.$$eval(`#sidebar-${t} .stat-btn[data-stat]`, bs => bs.map(x => x.dataset.stat));
    for (const s of stats) {
      await p.click(`#sidebar-${t} .stat-btn[data-stat="${s}"]`);
      const iface = await p.$('#interfaceRoot .stat-interface');
      if (!iface) errs.push('NO INTERFACE for ' + s);
      // click Try sample data + primary calculate
      const sample = await p.$('#interfaceRoot .sample-btn');
      if (sample) await sample.click();
      const go = await p.$('#interfaceRoot .primary-btn');
      if (go) await go.click();
      n++;
    }
  }
  console.log('tools exercised:', n);
  console.log(errs.length ? errs.slice(0, 40).join('\n') : 'NO ERRORS');
  if (errs.length) process.exitCode = 1;
  await b.close();
})();
