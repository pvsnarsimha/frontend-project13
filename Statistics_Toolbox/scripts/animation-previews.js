#!/usr/bin/env node
// Renders the "expected output" pictures in docs/animations/: for each animation, 4 real frames of it running in StatLab, each with the line the
// narrator speaks, laid out by docs/animations/storyboards.html (see docs/animations/README.md).
// Usage: node scripts/animation-previews.js      (needs Playwright + a Chromium; CHROMIUM=/path/to/chrome to use an installed one)
const fs = require('fs');
const os = require('os');
const path = require('path');
const launcher = require('../tests/e2e/launch');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'animations');
// id, file name, tool route, inputs to fill, Calculate button, tutor card key, the 4 frames [scene, progress 0..1]
const CASES = [
    [1, 'hypothesis-test', 'onesamplet', { '#oneSampleData': '52, 55, 53, 58, 54, 56, 57, 55, 59, 54', '#hypothesizedMean': '50' }, '#oneSampleTComputeBtn', 'test', [[0, 1], [1, 1], [2, 1], [4, 1]]],
    [2, 'mean-and-sd', 'stddev', { '#stddevInput': '4, 6, 7, 9, 12, 16' }, '#stddevComputeBtn', 'meansd', [[0, 0.7], [1, 1], [2, 1], [4, 1]]],
    [3, 'normal-z-score', 'zscore', { '#zscoreInput': '52, 55, 53, 58, 54, 56, 57, 55, 59, 54' }, '#zscoreComputeBtn', 'zscore', [[0, 1], [1, 0.6], [2, 1], [3, 1]]],
    [4, 'box-plot', 'boxplot', { '#boxplotInput': '12, 3, 19, 7, 15, 9, 22, 5, 11, 41' }, '#boxplotComputeBtn', 'boxplot', [[1, 1], [2, 1], [3, 1], [4, 1]]],
    [5, 'correlation', 'pearson', { '#pearsonXInput': '1, 2, 3, 4, 5, 6, 7, 8', '#pearsonYInput': '2.1, 3.9, 3.2, 5.8, 5.1, 7.4, 6.6, 9.0' }, '#pearsonComputeBtn', 'corr', [[0, 1], [1, 1], [2, 0.5], [3, 1]]],
    [6, 'regression', 'simplelinear', { '#simpleXInput': '1, 2, 3, 4, 5, 6, 7, 8', '#simpleYInput': '2.1, 3.9, 3.2, 5.8, 5.1, 7.4, 6.6, 9.0' }, '#simpleLinearComputeBtn', 'regress', [[1, 1], [2, 1], [3, 0.4], [3, 1]]],
    [7, 'sampling-clt', 'sampling', { '#samplingSeed': '5' }, '#samplingComputeBtn', 'clt', [[0, 1], [1, 0.6], [2, 1], [3, 1]]]
];

(async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'statlab-frames-'));
    const b = await launcher.launch();
    const appCtx = await b.newContext({ viewport: { width: 900, height: 1000 }, deviceScaleFactor: 2 });
    for (const [id, , tool, fill, btn, key, frames] of CASES) {
        const p = await appCtx.newPage();
        await p.goto('file://' + path.join(ROOT, 'Statistics.html') + '#tool=' + tool); await p.reload(); await p.waitForTimeout(300);
        for (const [sel, v] of Object.entries(fill)) await p.fill(sel, v);
        await p.click(btn); await p.waitForTimeout(1000);
        const card = p.locator('#tutorCard-' + key); await card.scrollIntoViewIfNeeded();
        for (let i = 0; i < frames.length; i++) {
            await p.evaluate(([k, s, pr]) => tutorCards.get(k).seek(s, pr), [key, ...frames[i]]); await p.waitForTimeout(80);
            await card.locator('.tutor-stage').screenshot({ path: path.join(tmp, `${id}-stage-${i + 1}.png`) });
            await card.locator('.tutor-caption').screenshot({ path: path.join(tmp, `${id}-caption-${i + 1}.png`) });
        }
        await p.close();
    }
    const sb = await (await b.newContext({ viewport: { width: 1800, height: 1000 }, deviceScaleFactor: 1 })).newPage();
    for (const [id, name] of CASES.map(c => [c[0], c[1]])) {
        await sb.goto('file://' + path.join(OUT, 'storyboards.html') + `?c=${id}&img=${encodeURIComponent('file://' + tmp)}`);
        await sb.waitForSelector('body[data-ready="1"]'); await sb.waitForTimeout(150);
        const file = path.join(OUT, `${String(id).padStart(2, '0')}-${name}.png`);
        await sb.locator('body').screenshot({ path: file });
        console.log('wrote', path.relative(ROOT, file));
    }
    await b.close();
    fs.rmSync(tmp, { recursive: true, force: true });
})();
