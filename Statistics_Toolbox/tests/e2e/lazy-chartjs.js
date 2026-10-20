// Chart.js is loaded on the first chart, not with the page: nothing fetches it at start-up, the first chart request
// fetches it exactly once and draws, later charts reuse it, and a failed fetch tells the user and can be retried.
// Usage: node tests/e2e/lazy-chartjs.js   (needs Playwright; set CHROMIUM=/path/to/chromium to use an existing browser)
const path = require('path');
const launcher = require('./launch');      // BROWSER=chromium|firefox|webkit

(async () => {
    const file = process.argv[2] || path.join(__dirname, '..', '..', 'Statistics.html');
    const browser = await launcher.launch();
    const page = await browser.newPage();
    const problems = [];
    const dialogs = [];
    // Requests for file:// sub-resources are not reported (or interceptable) in every browser Playwright drives, so the loads are counted
    // and, for the failure case, blocked inside the page: the app appends a <script src=".../chart.umd.js"> and that is what is observed.
    const hook = () => {
        window.__chartScripts = 0; window.__blockChart = false;
        const orig = Node.prototype.appendChild;
        Node.prototype.appendChild = function (node) {
            if (node && node.tagName === 'SCRIPT' && /chart\.umd\.js/.test(node.getAttribute('src') || '')) {
                window.__chartScripts++;
                if (window.__blockChart) { setTimeout(() => node.onerror && node.onerror(new Event('error')), 0); return node; }
            }
            return orig.call(this, node);
        };
    };
    const loads = pg => pg.evaluate(() => window.__chartScripts);
    page.on('dialog', d => { dialogs.push(d.message()); d.dismiss(); });
    page.on('pageerror', e => problems.push('script error: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) problems.push('console error: ' + m.text()); });
    await page.addInitScript(hook);

    const draw = async (tab, stat, canvasId) => {
        await page.click(`.tab[data-tab="${tab}"]`);
        await page.click(`.stat-btn[data-stat="${stat}"]`);
        await page.click('#interfaceRoot .sample-btn');
        await page.click('#interfaceRoot .primary-btn');
        return page.waitForFunction(id => typeof Chart !== 'undefined' && !!Chart.getChart(document.getElementById(id)), canvasId, { timeout: 5000 }).then(() => true, () => false);
    };

    await page.goto('file://' + file);
    await page.waitForTimeout(300);
    if (await loads(page)) problems.push('Chart.js was fetched at page load');
    if (await page.evaluate(() => typeof Chart !== 'undefined')) problems.push('Chart is defined before any chart was requested');

    if (!(await draw('manipulation', 'histogram', 'histogramChartCanvas'))) problems.push('histogram did not draw after lazy-loading Chart.js');
    const afterFirst = await loads(page);
    if (afterFirst !== 1) problems.push(`expected one Chart.js load after the first chart, saw ${afterFirst}`);
    if (!(await draw('manipulation', 'boxplot', 'boxplotChartCanvas'))) problems.push('boxplot did not draw');
    const afterSecond = await loads(page);
    if (afterSecond !== 1) problems.push(`Chart.js was loaded again for the second chart (${afterSecond} loads)`);

    // Failed fetch: a message, no script error, and the next attempt tries again
    const page2 = await browser.newPage();
    const dialogs2 = [];
    page2.on('dialog', d => { dialogs2.push(d.message()); d.dismiss(); });
    page2.on('pageerror', e => problems.push('(blocked fetch) script error: ' + e.message));
    await page2.addInitScript(hook);
    await page2.addInitScript(() => { window.__blockChart = true; });
    await page2.goto('file://' + file);
    await page2.click('.tab[data-tab="manipulation"]');
    await page2.click('.stat-btn[data-stat="histogram"]');
    await page2.click('#interfaceRoot .sample-btn');
    await page2.click('#interfaceRoot .primary-btn');
    await page2.waitForTimeout(500);
    const toastText = await page2.textContent('.toast.show').catch(() => '');
    if (!/Chart\.js/.test(toastText || '')) problems.push('no message was shown when Chart.js could not be loaded');
    if (dialogs2.length) problems.push('a blocking alert() was used instead of a toast: ' + dialogs2.join(' | '));
    await page2.evaluate(() => { window.__blockChart = false; });
    await page2.click('#interfaceRoot .primary-btn');
    const retried = await page2.waitForFunction(() => typeof Chart !== 'undefined' && !!Chart.getChart(document.getElementById('histogramChartCanvas')), null, { timeout: 5000 }).then(() => true, () => false);
    if (!retried) problems.push('retrying after a failed load did not draw the chart');

    console.log(problems.length ? problems.join('\n') : 'NO PROBLEMS');
    if (problems.length) process.exitCode = 1;
    await browser.close();
})();
