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
    assert.equal(els.demoStepsDisplay.innerHTML, '⚠️ bad', 'errors are escaped and shown through setHtml');
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

test('every Chart.js instance variable is registered with registerChart (so destroyAllCharts releases it)', () => {
    const declared = [], registered = [];
    for (const rel of scriptList()) {
        const src = fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\/\/.*$/gm, '');
        for (const m of src.matchAll(/^let (\w*[cC]hart\w*)\s*=\s*null;/gm)) declared.push(m[1]);
        for (const m of src.matchAll(/registerChart\(\(\)\s*=>\s*(\w+),\s*\(\)\s*=>\s*\{\s*\1\s*=\s*null;/g)) registered.push(m[1]);
    }
    assert.ok(declared.length >= 7, declared.join());
    assert.deepEqual([...declared].sort(), [...registered].sort(), 'a chart variable is declared but not registered (or the reverse)');
    // and the registry really releases them
    const probe = loadApp();
    let destroyed = 0;
    probe.histogramChart = null;
    probe.get('histogramChart = { destroy() { globalThis.__d = 1; } }');
    probe.destroyAllCharts();
    assert.equal(probe.get('histogramChart'), null);
});

test('sample-data contract: tools offering "Try sample data" declare an "Example:" placeholder', () => {
    const R = app.get('STAT_ROUTES');
    const withExample = Object.entries(R).filter(([, [render]]) => /placeholder="[^"]*(Example|e\.g\.)/i.test(render()));
    // Documented in README: this is how the sample button finds its data. Guard against regressions in coverage.
    // every tool is either parameter-only (declared with data-parameter-only) or declares an Example placeholder
    const missing = Object.entries(R).filter(([, [render]]) => { const html = render(); return !/data-parameter-only="true"/.test(html) && !/placeholder="[^"]*(Example|e\.g\.)/i.test(html); }).map(([name]) => name);
    assert.deepEqual(missing, [], 'tools with neither an Example placeholder nor parameterOnly');
    assert.ok(withExample.length >= 85, `only ${withExample.length} tools declare an Example placeholder`);
});

test('the app is self-contained: no external URLs in the page, styles or scripts (works offline)', () => {
    const files = ['Statistics.html', 'css/statlab.css', 'vendor/fonts/fonts.css', ...scriptList()];
    for (const rel of files) {
        // the only allowed external reference is the footer's "send feedback" link (a normal hyperlink to the project's issue tracker, nothing is fetched)
        const src = fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/<a href="https:\/\/github\.com\/pvsnarsimha\/frontend-project13\/issues\/new[^"]*" target="_blank" rel="noopener noreferrer">/g, '<a>');
        const external = [...src.matchAll(/(?:src|href)=["'](https?:)?\/\/[^"']+|url\(["']?https?:/g)].map(m => m[0]);
        deepEqual(external, [], `${rel} references an external resource`);
    }
    for (const rel of ['vendor/chart.umd.js', 'vendor/fonts/inter-latin-400-normal.woff2', 'vendor/fonts/jetbrains-mono-latin-700-normal.woff2'])
        assert.ok(fs.existsSync(path.join(ROOT, rel)), rel);
    // every font file referenced by fonts.css exists
    const css = fs.readFileSync(path.join(ROOT, 'vendor/fonts/fonts.css'), 'utf8');
    for (const m of css.matchAll(/url\('([^']+)'\)/g)) assert.ok(fs.existsSync(path.join(ROOT, 'vendor/fonts', m[1])), m[1]);
});

test('attachClearHandler empties every listed field (textarea and input) and hides the result area', () => {
    const fresh = loadApp();                                    // the shared app above had attachClearHandler replaced by a stub
    const handlers = {};
    const els = {
        clearBtn: { addEventListener: (ev, fn) => { handlers[ev] = fn; } },
        dataArea: { value: '1, 2, 3', tagName: 'TEXTAREA' },
        seedInput: { value: '42', tagName: 'INPUT' },
        otherInput: { value: 'keep me', tagName: 'INPUT' },
        results: { style: { display: 'block' } }
    };
    fresh.document.getElementById = id => els[id] || null;
    fresh.attachClearHandler('clearBtn', ['dataArea', 'seedInput'], 'results');
    assert.equal(typeof handlers.click, 'function', 'a click handler was registered');
    handlers.click();
    assert.equal(els.dataArea.value, '');
    assert.equal(els.seedInput.value, '', 'an <input> is cleared as well as a <textarea>');
    assert.equal(els.otherInput.value, 'keep me', 'fields that were not listed are untouched');
    assert.equal(els.results.style.display, 'none');

    // a single id still works, and missing elements are tolerated
    els.dataArea.value = 'x'; els.results.style.display = 'block';
    const single = {};
    els.clearBtn2 = { addEventListener: (ev, fn) => { single[ev] = fn; } };
    fresh.attachClearHandler('clearBtn2', 'dataArea', 'results');
    single.click();
    assert.equal(els.dataArea.value, '');
    assert.doesNotThrow(() => { fresh.attachClearHandler('noSuchButton', 'dataArea', 'results'); });
    els.clearBtn3 = { addEventListener: (ev, fn) => { single.c3 = fn; } };
    fresh.attachClearHandler('clearBtn3', ['dataArea', 'missingField', ''], 'missingResult');
    assert.doesNotThrow(() => single.c3());
});

test('the Clear buttons of two-input tools clear both fields', () => {
    const fresh = loadApp();
    const registered = [];
    fresh.attachClearHandler = (btn, ids, area) => registered.push({ btn, ids: [].concat(ids), area });
    fresh.setupPearsonLogic(); fresh.setupMannWhitneyLogic(); fresh.setupFTestLogic(); fresh.setupTwoSampleTLogic();
    const byBtn = Object.fromEntries(registered.map(r => [r.btn, r.ids]));
    assert.equal(byBtn.pearsonClearBtn.length, 2);
    assert.equal(byBtn.mannWhitneyClearBtn.length, 2);
    assert.equal(byBtn.ftestClearBtn.length, 2);
    assert.ok(byBtn.twoSampleTClearBtn.includes('twoSampleData1') && byBtn.twoSampleTClearBtn.includes('twoSampleData2'));     // both sample fields (and the summary fields)
});

test('stripEventHandlerAttributes removes on* attributes from tags but leaves text and other attributes alone', () => {
    const strip = app.stripEventHandlerAttributes;
    assert.equal(strip('<img src=x onerror="window.__xss=1">'), '<img src=x>');
    assert.equal(strip(`<a href="#" onclick='go()' class="k" onmouseover=evil() title="t">x</a>`), '<a href="#" class="k" title="t">x</a>');
    assert.equal(strip('<p ONCLICK = "a()">hi</p>'), '<p>hi</p>');
    assert.equal(strip('<svg/onload=alert(1)><img src="a"/onerror=b()>'), '<svg><img src="a">');
    assert.equal(strip('turn on = 5 and onset="3" in text'), 'turn on = 5 and onset="3" in text');
    assert.equal(strip('<td data-one="1" style="color:red">a</td>'), '<td data-one="1" style="color:red">a</td>');
    assert.equal(strip('<b>bold</b> & more'), '<b>bold</b> & more');
});

test('showDistributionParams: every field it generates is read back by the tool that asked for it', () => {
    const tools = {   // prefix -> [file, distributions its drop-down offers]
        pdf: ['pdf', ['normal', 'uniform', 'exponential', 'beta']], cdf: ['cdf', ['normal', 'uniform', 'exponential', 'beta']],
        quantile: ['quantile', ['normal', 'uniform', 'exponential', 'beta']], random: ['random', ['normal', 'uniform', 'exponential', 'beta']],
        expected: ['expected-value', ['normal', 'exponential', 'uniform', 'beta', 'poisson', 'binomial']],
        mgf: ['mgf', ['normal', 'exponential', 'uniform', 'poisson', 'binomial']],
        entropy: ['entropy', ['normal', 'exponential', 'uniform', 'beta', 'poisson', 'binomial']],
        varianceDist: ['distribution-variance', ['normal', 'exponential', 'uniform', 'beta', 'poisson', 'binomial']],
        distSkewness: ['dist-skewness', ['exponential', 'beta', 'poisson', 'binomial']],
        distKurtosis: ['dist-kurtosis', ['exponential', 'beta', 'poisson', 'binomial']]
    };
    const skipped = { entropy: ['Mean'], varianceDist: ['Mean'], distSkewness: ['Mean', 'Std', 'Min', 'Max'], distKurtosis: ['Mean', 'Std', 'Min', 'Max'] };   // fields these tools do not need
    const els = {};
    const el = id => (els[id] = els[id] || { value: '', html: '' });
    const probe = loadApp();
    require('vm').runInContext('setHtml = function (e, h) { e.html = h; }', probe);
    probe.document.getElementById = el;
    for (const [prefix, [file, dists]] of Object.entries(tools)) {
        const src = fs.readFileSync(path.join(ROOT, 'js/tools/probability', file + '.js'), 'utf8');
        for (const dist of dists) {
            el(prefix + 'Distribution').value = dist;
            probe.showDistributionParams(prefix, { skip: skipped[prefix] || [] });
            const ids = [...el(prefix + 'Params').html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
            assert.ok(ids.length > 0, `${prefix}/${dist}: no fields`);
            for (const id of ids) assert.ok(src.includes(id), `${prefix}/${dist}: nothing in ${file}.js reads ${id}`);
        }
    }
    // an unknown distribution leaves the form alone rather than blanking it
    el('pdfDistribution').value = 'weibull';
    el('pdfParams').html = 'kept';
    probe.showDistributionParams('pdf');
    assert.equal(el('pdfParams').html, 'kept');
});

test('choosing a tool from the sidebar moves focus to the new tool title (focus management)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
    assert.ok(/function focusToolTitle\(/.test(src));
    assert.ok(/switchToStat\(btn\.dataset\.stat\);\s*focusToolTitle\(\)/.test(src), 'sidebar click focuses the title');
    const forms = fs.readFileSync(path.join(ROOT, 'js/ui/forms.js'), 'utf8');
    assert.ok(forms.includes("'.interface-title', iface).forEach(t =>") && forms.includes('t.tabIndex = -1'), 'the title is a focusable heading');
});
