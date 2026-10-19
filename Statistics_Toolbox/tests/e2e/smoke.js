// Browser smoke test: opens every tool, loads sample data, presses Calculate and fails on any script error.
// Needs the Playwright dev dependency and a browser:  npm install && npx playwright install chromium
// Usage: node tests/e2e/smoke.js   (set CHROMIUM=/path/to/chromium to use an existing browser)
const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const file = process.argv[2] || path.join(__dirname, '..', '..', 'Statistics.html');
  const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  // The sanitiser test below inserts <img src=x>; that one deliberate failed request (and its console line) is expected
  let expectedMissing = 0;
  p.on('requestfailed', r => { if (/\/x$/.test(r.url())) expectedMissing++; else errs.push('REQUEST FAILED ' + r.url()); });
  p.on('console', m => { if (m.type() === 'error') { if (/Failed to load resource/.test(m.text()) && expectedMissing > 0) { expectedMissing--; return; } errs.push('CONSOLE ' + m.text()); } });
  await p.goto('file://' + file);
  // Record every HTML string the tools hand to setHtml(), so block-level tags can be checked for balance below
  await p.evaluate(() => { const orig = window.setHtml; window.__html = []; window.__tool = ''; window.setHtml = (el, h) => { window.__html.push([window.__tool, String(h)]); return orig(el, h); }; });
  const tabs = await p.$$eval('.tab', t => t.map(x => x.dataset.tab));
  let n = 0;
  for (const t of tabs) {
    await p.click(`.tab[data-tab="${t}"]`);
    const stats = await p.$$eval(`#sidebar-${t} .stat-btn[data-stat]`, bs => bs.map(x => x.dataset.stat));
    for (const s of stats) {
      await p.evaluate(name => { window.__tool = name; }, s);
      await p.click(`#sidebar-${t} .stat-btn[data-stat="${s}"]`);
      const iface = await p.$('#interfaceRoot .stat-interface');
      if (!iface) errs.push('NO INTERFACE for ' + s);
      // click Try sample data + primary calculate
      const sample = await p.$('#interfaceRoot .sample-btn');
      if (sample) await sample.click();
      const go = await p.$('#interfaceRoot .primary-btn');
      if (go) await go.click();
      // A tool that offers sample data must produce a clean, non-empty result for it
      if (sample && go) {
        const shown = await p.evaluate(() => {
          const v = document.querySelector('#interfaceRoot .result-value'), st = document.querySelector('#interfaceRoot .calculation-steps');
          return { value: v ? v.textContent.trim() : '', steps: st ? st.textContent : '' };
        });
        if (!shown.value || shown.value === '—') errs.push(`${s}: no result after calculating the sample data`);
        else if (/\bNaN\b|undefined|\[object/.test(shown.value + ' ' + shown.steps)) errs.push(`${s}: NaN/undefined in the result`);
      }
      n++;
    }
  }
  // Security: setHtml() must strip anything that can run code, whatever the tool put into the HTML string
  const sanitised = await p.evaluate(() => {
    window.__xss = 0;
    const box = document.createElement('div');
    document.body.appendChild(box);
    setHtml(box, '<img src=x onerror="window.__xss=1"><script>window.__xss=2<\/script><a href="java\nscript:window.__xss=3" onclick="window.__xss=4">link</a><iframe src="about:blank"></iframe><p style="color:red">kept <b>bold</b></p>');
    const html = box.innerHTML;
    box.querySelector('a').click();
    box.remove();
    return { html, flag: window.__xss };
  });
  if (sanitised.flag) errs.push('XSS payload executed: ' + sanitised.flag);
  if (/onerror|<script|<iframe|javascript:|onclick/i.test(sanitised.html)) errs.push('setHtml left dangerous markup: ' + sanitised.html);
  if (!/<b>bold<\/b>/.test(sanitised.html) || !/color:\s*red/.test(sanitised.html)) errs.push('setHtml removed harmless markup: ' + sanitised.html);
  // Markup: a missing </tr> or </div> is silently repaired by the parser, so it is only visible in the raw string
  const strings = await p.evaluate(() => window.__html);
  const TAGS = ['div', 'table', 'thead', 'tbody', 'tr', 'select', 'button', 'textarea', 'ul', 'ol', 'details'];
  const unbalanced = new Set();
  for (const [tool, str] of strings) {
    if (str.length < 300) continue;      // short strings are fragments of a larger piece of markup
    for (const tag of TAGS) {
      const open = (str.match(new RegExp(`<${tag}(?=[\\s>])`, 'g')) || []).length, close = (str.match(new RegExp(`</${tag}>`, 'g')) || []).length;
      if (open !== close) unbalanced.add(`${tool}: <${tag}> opened ${open}, closed ${close}`);
    }
  }
  for (const u of unbalanced) errs.push('UNBALANCED MARKUP ' + u);
  console.log('tools exercised:', n);
  console.log(errs.length ? errs.slice(0, 40).join('\n') : 'NO ERRORS');
  if (errs.length) process.exitCode = 1;
  await b.close();
})();
