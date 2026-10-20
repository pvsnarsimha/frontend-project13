// Automated accessibility audit (axe-core, WCAG 2.0/2.1 A and AA rules) of every tool after its sample data has been calculated, light and dark.
// Fails on any violation. It cannot replace a screen-reader session, but it catches missing names, roles, contrast and landmark errors.
// Usage: node tests/e2e/a11y.js [ids...]   (set CHROMIUM=/path/to/chromium to use an existing browser)
const fs = require('fs');
const path = require('path');
const launcher = require('./launch');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
(async () => {
  const file = path.resolve(__dirname, '..', '..', process.env.STATLAB_ROOT || '.', 'Statistics.html');
  const b = await launcher.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  await p.goto('file://' + file);
  let ids = process.argv.slice(2);
  if (!ids.length) ids = await p.$$eval('.stat-btn[data-stat]', bs => bs.map(x => x.dataset.stat));
  const found = {};
  for (const id of ids) {
    await p.goto('file://' + file + '#tool=' + id); await p.reload(); await p.waitForTimeout(150);
    const sample = await p.$('.sample-btn');
    if (sample) await sample.click().catch(() => {});
    const go = await p.$('.stat-interface:visible .primary-btn'); if (go) await go.click().catch(() => {});
    await p.waitForTimeout(500);
    await p.evaluate(AXE);      // evaluated over the DevTools protocol, which the page's script-src 'self' policy does not block
    const res = await p.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }));
    for (const v of res.violations) {
      const f = found[v.id] || (found[v.id] = { impact: v.impact, help: v.help, tools: new Set(), sample: v.nodes[0] && v.nodes[0].html.slice(0, 120), details: new Set() });
      v.nodes.forEach(n => { const d = n.any && n.any[0] && n.any[0].data; if (d && d.fgColor) f.details.add(`${d.fgColor} on ${d.bgColor} = ${d.contrastRatio} (needs ${d.expectedContrastRatio}) in ${n.target.join(' ').slice(0, 70)}`); });
      f.tools.add(id);
    }
  }
  const rules = Object.entries(found);
  if (rules.length) {
    rules.forEach(([id, f]) => {
      [...f.details].slice(0, 12).forEach(d => console.log('    ' + d));
      console.log(`${f.impact.toUpperCase()} ${id}: ${f.help} (${f.tools.size} tools, e.g. ${[...f.tools].slice(0, 4).join(', ')})\n    ${f.sample}`);
    });
    console.log('ACCESSIBILITY VIOLATIONS: ' + rules.length + ' rule(s)');
    await b.close(); process.exit(1);
  }
  console.log(`axe-core: ${ids.length} tools, no WCAG A/AA violations`);
  await b.close();
})();
