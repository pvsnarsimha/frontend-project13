#!/usr/bin/env node
// Renders the "expected output" pictures in docs/animations/: one storyboard PNG per planned animation (see docs/animations/README.md).
// Storyboard 1 is made from real frames of the running hypothesis-test animation; the others are mockups drawn by docs/animations/storyboards.html.
// Usage: node scripts/animation-previews.js      (needs Playwright + a Chromium; CHROMIUM=/path/to/chrome to use an installed one)
const fs = require('fs');
const os = require('os');
const path = require('path');
const launcher = require('../tests/e2e/launch');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'animations');
const NAMES = { 1: 'hypothesis-test', 2: 'mean-and-sd', 3: 'normal-z-score', 4: 'box-plot', 5: 'correlation', 6: 'regression', 7: 'sampling-clt' };

(async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'statlab-frames-'));
    const b = await launcher.launch();
    // 1. real frames of the hypothesis-test animation (one-sample t, n = 10, mu0 = 50: a clear rejection)
    const app = await (await b.newContext({ viewport: { width: 470, height: 900 }, deviceScaleFactor: 2 })).newPage();
    await app.goto('file://' + path.join(ROOT, 'Statistics.html') + '#tool=onesamplet'); await app.reload(); await app.waitForTimeout(300);
    await app.fill('#oneSampleData', '52, 55, 53, 58, 54, 56, 57, 55, 59, 54'); await app.fill('#hypothesizedMean', '50');
    await app.click('#oneSampleTComputeBtn'); await app.waitForTimeout(900);
    await app.locator('#tutorCard-test').scrollIntoViewIfNeeded();
    const frames = [[0, 1], [1, 1], [2, 1], [4, 1]];
    for (let i = 0; i < frames.length; i++) {
        await app.evaluate(([s, p]) => tutorCards.get('test').seek(s, p), frames[i]); await app.waitForTimeout(80);
        await app.locator('#tutorCard-test .tutor-stage').screenshot({ path: path.join(tmp, `hypothesis-stage-${i + 1}.png`) });
        await app.locator('#tutorCard-test .tutor-caption').screenshot({ path: path.join(tmp, `hypothesis-caption-${i + 1}.png`) });
    }
    // 2. the seven storyboards
    const sb = await (await b.newContext({ viewport: { width: 1700, height: 900 }, deviceScaleFactor: 2 })).newPage();
    for (const id of Object.keys(NAMES)) {
        const url = 'file://' + path.join(OUT, 'storyboards.html') + `?c=${id}&img=${encodeURIComponent('file://' + tmp)}`;
        await sb.goto(url); await sb.waitForSelector('body[data-ready="1"]'); await sb.waitForTimeout(200);
        const file = path.join(OUT, `${String(id).padStart(2, '0')}-${NAMES[id]}.png`);
        await sb.locator('body').screenshot({ path: file });
        console.log('wrote', path.relative(ROOT, file));
    }
    await b.close();
    fs.rmSync(tmp, { recursive: true, force: true });
})();
