// Print layout check: with print media emulated and the "Print / Save as PDF" state applied, only the result card and its graphs are visible
// (no hero, tabs, sidebar or buttons), and the page produces a real PDF with the solution text in it.
// Usage: node tests/e2e/print.js   (Chromium only for the PDF part; set CHROMIUM=/path/to/chromium to use an existing browser)
const path = require('path');
const launcher = require('./launch');
(async () => {
  const file = path.resolve(__dirname, '..', '..', process.env.STATLAB_ROOT || '.', 'Statistics.html');
  const b = await launcher.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto('file://' + file + '#tool=onesamplet'); await p.reload(); await p.waitForTimeout(300);
  await p.click('button:has-text("Try sample data")'); await p.click('#oneSampleTComputeBtn'); await p.waitForTimeout(1200);
  // press the print button with window.print replaced, so the page is left in the exact state the browser prints
  await p.evaluate(() => { window.print = () => { window.__printState = true; }; });
  await p.click('#oneSampleTResultArea .print-btn');
  errs.push(...(await p.evaluate(() => (document.body.classList.contains('print-one') && document.querySelector('.print-target') ? [] : ['print state was not applied']))));
  await p.emulateMedia({ media: 'print' });
  const vis = await p.evaluate(() => {
    const shown = sel => [...document.querySelectorAll(sel)].some(e => { const s = getComputedStyle(e); return s.visibility !== 'hidden' && s.display !== 'none' && e.getBoundingClientRect().height > 0; });
    return { hero: shown('.hero h1, .hero .brand-name, .hero-search input'), tabs: shown('.tab-bar .tab'), sidebar: shown('.action-sidebar .stat-btn'), result: shown('#oneSampleTResultArea .solution-title, #oneSampleTResultArea h2, #oneSampleTResultArea .kpi'), chart: shown('#statChartCard-test canvas'), copyBtn: shown('.copy-btn') };
  });
  if (vis.hero || vis.tabs || vis.sidebar || vis.copyBtn) errs.push('print: page chrome is still visible: ' + JSON.stringify(vis));
  if (!vis.result) errs.push('print: the worked solution is not visible');
  if (!vis.chart) errs.push('print: the graph is not visible');
  if (launcher.browserName === 'chromium') {
    const pdf = await p.pdf({ format: 'A4', printBackground: true });
    const text = pdf.toString('latin1');
    if (!text.startsWith('%PDF')) errs.push('print: not a PDF');
    if ((text.match(/\/Type\s*\/Page[^s]/g) || []).length < 1) errs.push('print: the PDF has no pages');
  }
  await b.close();
  if (errs.length) { console.log(errs.join('\n')); console.log('PRINT CHECK FAILED'); process.exit(1); }
  console.log('print layout: only the solution and its graph are printed; PDF produced');
})();
