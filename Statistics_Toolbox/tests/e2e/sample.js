// Sample-data test: for every tool, press "Try sample data" and Calculate, then check the page's own output.
// Contract: every tool that offers sample data produces a non-empty answer and worked solution with no NaN / Infinity /
// undefined / [object Object], no HTML-entity debris ("&#10;") left in the sample text, no script error, and no duplicate element ids.
// Usage: node tests/e2e/sample.js   (needs Playwright; set CHROMIUM=/path/to/chromium to use an existing browser)
const path = require('path');
const launcher = require('./launch');      // BROWSER=chromium|firefox|webkit

const BAD_OUTPUT = /\bNaN\b|-?\bInfinity\b|\bundefined\b|\[object/;
// Tools that legitimately offer no sample button declare themselves parameter-only (parameterOnly: true in their buildInterface
// config, rendered as data-parameter-only on the interface): number fields and drop-downs, no pasted data. No list to keep in sync here.

(async () => {
    const file = process.argv[2] || path.join(__dirname, '..', '..', 'Statistics.html');
    const browser = await launcher.launch();
    const page = await browser.newPage();
    const problems = [];
    let current = 'load';
    page.on('dialog', d => d.dismiss());
    page.on('pageerror', e => problems.push(`${current}: script error: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') problems.push(`${current}: console error: ${m.text()}`); });
    await page.goto('file://' + file);

    let tools = 0, withSample = 0;
    const tabs = await page.$$eval('.tab', t => t.map(x => x.dataset.tab));
    for (const tab of tabs) {
        await page.click(`.tab[data-tab="${tab}"]`);
        const stats = await page.$$eval(`#sidebar-${tab} .stat-btn[data-stat]`, bs => bs.map(x => x.dataset.stat));
        for (const stat of stats) {
            current = stat;
            await page.click(`#sidebar-${tab} .stat-btn[data-stat="${stat}"]`);
            tools++;
            const sample = await page.$('#interfaceRoot .sample-btn');
            const go = await page.$('#interfaceRoot .primary-btn');
            if (!sample) { if (!(await page.$('#interfaceRoot .stat-interface[data-parameter-only]'))) problems.push(`${stat}: no "Try sample data" button (and not declared parameterOnly)`); continue; }
            await sample.click();
            const typed = await page.$$eval('#interfaceRoot textarea', a => a.map(t => t.value));
            if (typed.some(v => /&#?\w+;/.test(v))) problems.push(`${stat}: sample text still contains an HTML entity: ${JSON.stringify(typed)}`);
            await go.click({ timeout: 8000 });
            withSample++;
            const shown = await page.evaluate(() => {
                const root = document.querySelector('#interfaceRoot');
                const value = root.querySelector('.result-value'), steps = root.querySelector('.calculation-steps');
                const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
                return {
                    value: value ? value.textContent.replace(/^Answer:\s*/, '').trim() : '',
                    answerLabel: !!(value && value.querySelector('.answer-prefix')),
                    steps: steps ? steps.textContent : '',
                    stepsLive: steps ? steps.getAttribute('aria-live') : null,
                    dupIds: ids.filter((id, i) => ids.indexOf(id) !== i)
                };
            });
            if (!shown.value || shown.value === '—') problems.push(`${stat}: empty answer after calculating the sample`);
            if (BAD_OUTPUT.test(shown.value + ' ' + shown.steps)) problems.push(`${stat}: NaN/Infinity/undefined in the result`);
            if (!shown.answerLabel && shown.value && shown.value !== '—') problems.push(`${stat}: the answer has no screen-reader "Answer:" label`);
            if (shown.stepsLive) problems.push(`${stat}: the worked solution must not be an aria-live region (the short answer is the live region)`);
            if (shown.dupIds.length) problems.push(`${stat}: duplicate element ids ${[...new Set(shown.dupIds)].join(', ')}`);
        }
    }

    // Page-level accessibility: the one tab panel is named by the selected tab; charts are labelled with what they show
    const panel = await page.evaluate(() => {
        const p = document.getElementById('mainPanel'), tab = document.querySelector('.tab[aria-selected="true"]');
        return { role: p.getAttribute('role'), labelledby: p.getAttribute('aria-labelledby'), tab: tab.id };
    });
    if (panel.role !== 'tabpanel' || panel.labelledby !== panel.tab) problems.push(`tab panel is not labelled by the selected tab: ${JSON.stringify(panel)}`);
    for (const [stat, canvasId] of [['histogram', 'histogramChartCanvas'], ['boxplot', 'boxplotChartCanvas'], ['violin', 'violinChartCanvas'], ['qqplot', 'qqplotChartCanvas'], ['ppplot', 'ppplotChartCanvas'], ['stemleaf', 'stemLeafScatterChart']]) {
        const tab = await page.evaluate(s => document.querySelector(`.stat-btn[data-stat="${s}"]`).closest('.action-sidebar').dataset.module, stat);
        await page.click(`.tab[data-tab="${tab}"]`);
        await page.click(`.stat-btn[data-stat="${stat}"]`);
        await page.click('#interfaceRoot .sample-btn');
        await page.click('#interfaceRoot .primary-btn');
        await page.waitForTimeout(400);
        const label = await page.evaluate(id => { const c = document.getElementById(id); return c ? { role: c.getAttribute('role'), label: c.getAttribute('aria-label') } : null; }, canvasId);
        if (!label || label.role !== 'img' || !/\d/.test(label.label || '') || /^chart$/i.test(label.label)) problems.push(`${stat}: chart canvas has no descriptive aria-label (${JSON.stringify(label)})`);
    }

    console.log(`tools opened: ${tools}, sample + Calculate run: ${withSample}`);
    console.log(problems.length ? problems.slice(0, 60).join('\n') : 'NO PROBLEMS');
    if (problems.length) process.exitCode = 1;
    await browser.close();
})();
