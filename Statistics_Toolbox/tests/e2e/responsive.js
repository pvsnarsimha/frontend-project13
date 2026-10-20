// Responsive test: at phone widths no tool may make the page scroll sideways (wide tables scroll inside their own box).
// Usage: node tests/e2e/responsive.js   (needs Playwright; set CHROMIUM=/path/to/chromium to use an existing browser)
const path = require('path');
const launcher = require('./launch');      // BROWSER=chromium|firefox|webkit

const WIDTHS = [360, 768];

(async () => {
    const file = process.argv[2] || path.resolve(__dirname, '..', '..', process.env.STATLAB_ROOT || '.', 'Statistics.html');
    const browser = await launcher.launch();
    const problems = [];
    let checked = 0;
    for (const width of WIDTHS) {
        const page = await browser.newPage({ viewport: { width, height: 800 } });
        page.on('dialog', d => d.dismiss());
        await page.goto('file://' + file);
        const overflow = () => page.evaluate(() => {
            const de = document.documentElement;
            if (de.scrollWidth - de.clientWidth <= 1) return null;
            let worst = null;
            document.querySelectorAll('body *').forEach(e => {
                const r = e.getBoundingClientRect();
                if (r.width && r.right > de.clientWidth + 1 && !e.closest('.table-scroll, .rd-scroll, .tab-bar, .action-sidebar, pre') && (!worst || r.right > worst.right))
                    worst = { tag: e.tagName, cls: String(e.className).slice(0, 40), id: e.id, right: Math.round(r.right) };
            });
            return { by: de.scrollWidth - de.clientWidth, worst };
        });
        // A table wider than the box it sits in must scroll inside .table-scroll / .rd-scroll, even when the page itself
        // does not overflow (a narrow table in a wide card is fine; a wide table in a narrow card is the bug).
        const unwrappedTables = () => page.evaluate(() => [...document.querySelectorAll('#interfaceRoot table')].filter(t => {
            if (t.closest('.table-scroll, .rd-scroll')) return false;
            const box = t.parentElement, cs = getComputedStyle(box);
            const inner = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
            return t.getBoundingClientRect().width > inner + 1 || t.scrollWidth > t.clientWidth + 1;
        }).map(t => (t.closest('.stat-interface')?.id || 'tool') + ' table' + (t.id ? '#' + t.id : '') + ' ' + Math.round(t.getBoundingClientRect().width) + 'px'));
        const shell = await overflow();
        if (shell) problems.push(`${width}px page shell: ${JSON.stringify(shell)}`);
        const tabs = await page.$$eval('.tab', t => t.map(x => x.dataset.tab));
        for (const tab of tabs) {
            await page.click(`.tab[data-tab="${tab}"]`);
            const stats = await page.$$eval(`#sidebar-${tab} .stat-btn[data-stat]`, bs => bs.map(x => x.dataset.stat));
            for (const stat of stats) {
                await page.click(`#sidebar-${tab} .stat-btn[data-stat="${stat}"]`);
                const sample = await page.$('#interfaceRoot .sample-btn');
                if (sample) await sample.click();
                const go = await page.$('#interfaceRoot .primary-btn');
                if (go) await go.click();
                await page.waitForTimeout(30);
                const o = await overflow();
                checked++;
                for (const t of await unwrappedTables()) problems.push(`${width}px ${stat}: wide table outside a scroll wrapper (${t})`);
                if (o) problems.push(`${width}px ${stat}: page is ${o.by}px wider than the screen (widest: ${JSON.stringify(o.worst)})`);
            }
        }
        await page.close();
    }
    console.log(`responsive checks: ${checked} (widths ${WIDTHS.join(', ')})`);
    console.log(problems.length ? problems.join('\n') : 'NO HORIZONTAL OVERFLOW');
    if (problems.length) process.exitCode = 1;
    await browser.close();
})();
