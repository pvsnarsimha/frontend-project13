// Edge-case test: feeds every tool degenerate data (one value, identical values, zeros, negatives, two values, huge values).
// Contract: the page never freezes, never throws, and whenever a result contains NaN / Infinity / undefined it also shows
// the "Some values are not defined for this data" note, so users are told why instead of seeing a bare NaN.
// Usage: node tests/e2e/edge-cases.js   (needs Playwright; set CHROMIUM=/path/to/chromium to use an existing browser)
const path = require('path');
const { chromium } = require('playwright');

const CASES = {
    single: '5',
    constant: '4, 4, 4, 4, 4, 4',
    zeros: '0, 0, 0, 0, 0',
    negatives: '-3, -1, -2, -5, -4, -6',
    two: '1, 2',
    huge: '1e308, 1e308, 1e308'
};
const UNDEFINED = /\bNaN\b|-?\bInfinity\b|\bundefined\b|\[object/;

(async () => {
    const file = process.argv[2] || path.join(__dirname, '..', '..', 'Statistics.html');
    const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
    const open = async () => {
        const page = await browser.newPage();
        page.on('dialog', d => d.dismiss());
        page.on('pageerror', e => problems.push(`${current}: script error: ${e.message}`));
        await page.goto('file://' + file);
        return page;
    };
    const problems = [];
    let current = '';
    let page = await open();
    let runs = 0;

    const tabs = await page.$$eval('.tab', t => t.map(x => x.dataset.tab));
    for (const tab of tabs) {
        await page.click(`.tab[data-tab="${tab}"]`);
        const stats = await page.$$eval(`#sidebar-${tab} .stat-btn[data-stat]`, bs => bs.map(x => x.dataset.stat));
        for (const stat of stats) {
            for (const [name, value] of Object.entries(CASES)) {
                current = `${stat}/${name}`;
                await page.click(`#sidebar-${tab} .stat-btn[data-stat="${stat}"]`);
                await page.$$eval('#interfaceRoot textarea', (areas, v) => areas.forEach(a => { a.value = v; }), value);
                const go = await page.$('#interfaceRoot .primary-btn');
                if (!go) continue;
                try {
                    await go.click({ timeout: 6000 });
                } catch (e) {
                    problems.push(`${current}: page froze (click did not return within 6s)`);
                    await page.close().catch(() => {});
                    page = await open();
                    await page.click(`.tab[data-tab="${tab}"]`);
                    continue;
                }
                runs++;
                const shown = await page.evaluate(() => {
                    const v = document.querySelector('#interfaceRoot .result-value'), s = document.querySelector('#interfaceRoot .calculation-steps');
                    return { text: (v ? v.textContent : '') + ' ' + (s ? s.textContent : ''), note: !!document.querySelector('#interfaceRoot .undef-note') };
                });
                if (UNDEFINED.test(shown.text) && !shown.note) problems.push(`${current}: shows NaN/Infinity/undefined without an explanation`);
            }
        }
    }
    console.log(`edge-case runs: ${runs}`);
    console.log(problems.length ? problems.join('\n') : 'NO PROBLEMS');
    if (problems.length) process.exitCode = 1;
    await browser.close();
})();
