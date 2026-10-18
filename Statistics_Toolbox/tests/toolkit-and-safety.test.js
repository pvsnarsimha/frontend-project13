'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const deepEqual = require('node:assert').deepEqual;
const fs = require('fs');
const path = require('path');
const { loadApp, scriptList, ROOT } = require('./load-app');

const app = loadApp();
const html = fs.readFileSync(path.join(ROOT, 'Statistics.html'), 'utf8');
const close = (a, e, t) => assert.ok(Math.abs(a - e) <= t, `expected ${e}, got ${a}`);

test('defineListTool renders the expected form and wires one handler per button', () => {
    const calls = [];
    const el = () => ({ value: '3 1 2', style: {}, innerText: '', addEventListener: (ev, fn) => calls.push([ev, fn]) });
    const els = {};
    app.document.getElementById = id => (els[id] = els[id] || el());
    app.attachClearHandler = () => {};
    const tool = app.defineListTool({
        id: 'demo', interfaceId: 'statDemoInterface', title: 'Demo', formula: 'f', desc: 'd', placeholder: 'Example: 1, 2',
        buttonText: 'Go', resultLabel: 'RESULT', empty: { value: 'No data', steps: 'Enter numbers' },
        min: { count: 2, value: 'Need 2', steps: 'two please' },
        compute: n => (n.includes(99) ? { error: true, message: 'bad' } : { steps: 'ok ' + n.length, v: n.length }),
        display: r => 'n=' + r.v
    });
    const out = tool.render();
    for (const id of ['demoInput', 'demoComputeBtn', 'demoClearBtn', 'demoResultArea', 'demoValueDisplay', 'demoStepsDisplay'])
        assert.ok(out.includes(`id="${id}"`), id);
    tool.setup();
    assert.equal(calls.length, 1);
    calls[0][1]();                                                      // click with "3 1 2"
    assert.equal(els.demoValueDisplay.innerText, 'n=3');
    assert.equal(els.demoStepsDisplay.innerText, 'ok 3');
    els.demoInput.value = '';  calls[0][1]();
    assert.equal(els.demoValueDisplay.innerText, 'No data');
    els.demoInput.value = '5'; calls[0][1]();
    assert.equal(els.demoValueDisplay.innerText, 'Need 2');
    els.demoInput.value = '99 1'; calls[0][1]();
    assert.equal(els.demoValueDisplay.innerText, 'Error');
    assert.equal(els.demoStepsDisplay.innerText, 'bad');
});

test('list tools converted to the toolkit still compute the same answers', () => {
    const R = app.get('STAT_ROUTES');
    for (const k of ['mean', 'median', 'mode', 'geometric', 'harmonic', 'variance', 'stddev', 'range', 'cv', 'skewness', 'kurtosis'])
        assert.ok(R[k][0]().includes('class="stat-interface"'), k);
    close(app.computeVarianceWithSteps([2, 4, 4, 4, 5, 5, 7, 9]).sample, 4.571428571428571, 1e-12);
    close(app.computeGeometricWithSteps([2, 8, 4]).value, 4, 1e-12);
    close(app.computeHarmonicWithSteps([2, 4, 8, 16]).value, 4 / (1 / 2 + 1 / 4 + 1 / 8 + 1 / 16), 1e-12);
});

test('user-supplied group labels are HTML-escaped before they reach innerHTML', () => {
    assert.equal(app.escapeHtml('<img src=x onerror="a()"> & b'), '&lt;img src=x onerror=&quot;a()&quot;&gt; &amp; b');
    const r = app.computeTukeyHSD('4:<b>A\n5:<b>A\n6:<b>A\n8:B\n9:B\n7:B\n12:C\n11:C\n13:C', 0.05);
    assert.ok(!r.error);
    assert.ok(!r.steps.includes('<b>A'), 'raw label must not appear in the generated HTML');
    assert.ok(r.steps.includes('&lt;b&gt;A'));
});

test('page ships a Content-Security-Policy and no inline event handlers or inline scripts', () => {
    assert.match(html, /Content-Security-Policy/);
    assert.match(html, /script-src 'self';/);
    assert.ok(!/<script>/.test(html), 'no inline <script> in the page');
    for (const rel of scriptList()) {
        const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
        assert.ok(!/\son(click|error|load|change|input|mouse\w+)=/i.test(src), `${rel} generates an inline event handler`);
        assert.ok(!/steps\.push\('<script>'\)/.test(src), `${rel} emits an inline <script>`);
    }
});

test("Cook's distance keeps observation order and survives leverage 1 / perfect fit", () => {
    const x = [1, 2, 3, 4, 5, 6, 7, 8], y = [2.1, 3.9, 6.2, 7.8, 10.1, 12.2, 13.8, 16.1];
    const r = app.computeCooksDistance(x, y);
    const expected = [0.083828152287804, 0.13714863567579885, 0.11979977907293649, 0.13664448941782467, 0.015504039574941859, 0.12999107972324114, 0.3837441495404645, 0.13098148794971085];   // statsmodels
    expected.forEach((v, i) => close(r.cooksDistances[i], v, 1e-9));
    const perfect = app.computeCooksDistance(x, x.map(v => 2 * v));
    assert.ok(perfect.cooksDistances.every(d => d === 0));
    const lev1 = app.computeCooksDistance([1, 1, 1, 1, 1, 1, 1, 9], [2, 3, 2, 3, 2, 3, 2, 50]);
    assert.equal(lev1.cooksDistances[7], Infinity);
    assert.ok(!/NaN/.test(lev1.steps));
});

test('every plotting tool is covered by destroyAllCharts', () => {
    const appSrc = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
    const declared = [];
    for (const rel of scriptList()) {
        const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
        for (const m of src.matchAll(/^let (\w*[cC]hart\w*)\s*=\s*null;/gm)) declared.push(m[1]);
    }
    assert.ok(declared.length >= 7, declared.join());
    for (const name of declared) assert.ok(appSrc.includes(`() => ${name}`), `${name} is not released when switching tools`);
});

test('sample-data contract: tools offering "Try sample data" declare an "Example:" placeholder', () => {
    const R = app.get('STAT_ROUTES');
    const withExample = Object.entries(R).filter(([, [render]]) => /placeholder="[^"]*(Example|e\.g\.)/i.test(render()));
    // Documented in README: this is how the sample button finds its data. Guard against regressions in coverage.
    assert.ok(withExample.length >= 85, `only ${withExample.length} tools declare an Example placeholder`);
});

test('the app is self-contained: no external URLs in the page, styles or scripts (works offline)', () => {
    const files = ['Statistics.html', 'css/statlab.css', 'vendor/fonts/fonts.css', ...scriptList()];
    for (const rel of files) {
        const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
        const external = [...src.matchAll(/(?:src|href)=["'](https?:)?\/\/[^"']+|url\(["']?https?:/g)].map(m => m[0]);
        deepEqual(external, [], `${rel} references an external resource`);
    }
    for (const rel of ['vendor/chart.umd.js', 'vendor/fonts/inter-latin-400-normal.woff2', 'vendor/fonts/jetbrains-mono-latin-700-normal.woff2'])
        assert.ok(fs.existsSync(path.join(ROOT, rel)), rel);
    // every font file referenced by fonts.css exists
    const css = fs.readFileSync(path.join(ROOT, 'vendor/fonts/fonts.css'), 'utf8');
    for (const m of css.matchAll(/url\('([^']+)'\)/g)) assert.ok(fs.existsSync(path.join(ROOT, 'vendor/fonts', m[1])), m[1]);
});
