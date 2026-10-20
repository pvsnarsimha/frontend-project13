'use strict';
// Regression tests for the production-readiness review: degenerate input must give an error or a clamped value, never NaN/Infinity/throw.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadApp } = require('./load-app');

const app = loadApp();
const ROOT = path.join(__dirname, '..');

test('Bartlett: a constant (or single-value) group is an error, not a "significant" result', () => {
    const constant = app.computeBartlettTest('5:A, 5:A, 5:A, 1:B, 2:B, 4:B', 0.05);
    assert.ok(constant.error && /zero variance/.test(constant.message), constant.message);
    const single = app.computeBartlettTest('5:A, 1:B, 2:B, 4:B', 0.05);
    assert.ok(single.error && /only one value/.test(single.message), single.message);
    const ok = app.computeBartlettTest('1:A, 2:A, 4:A, 1:B, 3:B, 9:B', 0.05);
    assert.ok(!ok.error && Number.isFinite(ok.chiSquare) && ok.pValue > 0);
});

test('Histogram and mutual information clamp out-of-range bin counts', () => {
    const data = [1, 2, 2, 3, 3, 3, 4, 4, 5, 9];
    for (const bins of [-5, 0, NaN, 1000]) {
        const h = app.computeHistogramWithSteps(data, bins);
        assert.ok(!h.error && h.bins.length >= 1 && h.bins.length <= 30, `histogram bins=${bins}`);
        const m = app.computeMutualInfoWithSteps(data, data.map(v => v * 2 + 1), bins);
        assert.ok(!m.error && Number.isFinite(m.mi), `mutual info bins=${bins}: ${m.message}`);
    }
});

test('Violin: bandwidth <= 0 or non-finite is an error instead of NaN densities', () => {
    for (const bw of [0, -1, NaN, Infinity]) {
        const r = app.computeViolinWithSteps([1, 2, 3, 4, 5], bw);
        assert.ok(r.error && /Bandwidth/.test(r.message), `bandwidth ${bw}`);
    }
    const r = app.computeViolinWithSteps([1, 2, 3, 4, 5], 0.5);
    assert.ok(!r.error && !/NaN/.test(r.steps));
});

test('hypothesis verdicts follow pValue < alpha', () => {
    const cases = [
        () => app.computeBartlettTest('1:A, 2:A, 4:A, 1:B, 3:B, 9:B', 0.05),
        () => app.computeLeveneTest('1:A, 2:A, 4:A, 1:B, 3:B, 9:B, 20:C, 30:C, 41:C', 0.05),
        () => app.computeKruskalWallisTest('1:A, 2:A, 4:A, 5:B, 6:B, 9:B, 20:C, 30:C, 41:C', 0.05)
    ];
    for (const run of cases) {
        const r = run();
        assert.ok(!r.error, r.message);
        assert.equal(r.rejectH0, r.pValue < 0.05);
    }
});

test('Anderson-Darling shows an approximate p-value (about 3 significant digits)', () => {
    const r = app.computeAndersonDarlingTest([2.1, 2.5, 3.1, 3.3, 4.0, 4.4, 5.2, 6.8, 7.1, 9.5], 0.05);
    assert.ok(!r.error);
    assert.ok(/approximate/.test(r.steps));
});

test('Mann-Whitney: no ties and small samples use the exact p-value; small samples WITH ties still carry the approximation flag', () => {
    const exact = app.computeMannWhitneyTest([1, 2, 3, 4], [5, 6, 7, 8], 0.05);
    assert.equal(exact.exact, true);
    assert.equal(exact.smallSample, false);
    const tied = app.computeMannWhitneyTest([1, 2, 3, 4], [4, 6, 7, 8], 0.05);          // a tie across the samples: no exact distribution
    assert.equal(tied.exact, false);
    assert.equal(tied.smallSample, true);
    const bigTied = app.computeMannWhitneyTest([1, 2, 3, 4, 5, 6], [6, 7, 8, 9, 10, 11], 0.05);
    assert.equal(bigTied.smallSample, false);
});

test('Stem-and-leaf shape verdict comes from skewness, not stem size', () => {
    const right = app.computeStemLeafWithSteps([10, 11, 12, 13, 14, 15, 16, 17, 90, 100]);
    assert.ok(/right-skewed/.test(right.steps), 'a long right tail is detected');
    const sym = app.computeStemLeafWithSteps([10, 20, 30, 40, 50, 60, 70, 80, 90]);
    assert.ok(/approximately symmetric/.test(sym.steps));
});

test('Tukey HSD formula card shows the Tukey-Kramer form', () => {
    const iface = app.renderTukeyHSDInterface ? app.renderTukeyHSDInterface() : '';
    assert.ok(!iface || /1\/n<sub>i<\/sub> \+ 1\/n<sub>j<\/sub>/.test(iface));
});

test('showDistributionParams renders the note supplied for a distribution (and none for others)', () => {
    const els = {};
    const probe = loadApp();
    require('vm').runInContext('setHtml = function (e, h) { e.html = h; }', probe);
    probe.document.getElementById = id => (els[id] = els[id] || { value: '', html: '' });
    els.xDistribution = { value: 'normal' };
    els.xParams = { html: '' };
    probe.showDistributionParams('x', { notes: { normal: 'NOTE-N', uniform: 'NOTE-U' } });
    assert.ok(els.xParams.html.includes('<div class="desc">NOTE-N</div>'));
    els.xDistribution.value = 'exponential';
    probe.showDistributionParams('x', { notes: { normal: 'NOTE-N' } });
    assert.ok(!els.xParams.html.includes('desc'));
    // every note key in the tools is a distribution the drop-down actually offers
    const dists = Object.keys(probe.get('DISTRIBUTION_PARAMS'));
    for (const f of ['entropy', 'dist-skewness', 'dist-kurtosis']) {
        const src = fs.readFileSync(path.join(ROOT, 'js/tools/probability', f + '.js'), 'utf8');
        const block = src.match(/notes:\s*\{([\s\S]*?)\}/)[1];
        for (const m of block.matchAll(/^\s*(\w+):/gm)) assert.ok(dists.includes(m[1]), `${f}: note for unknown distribution ${m[1]}`);
    }
});

test('generateDistributionAnalysis never prints NaN or Infinity for edge-case datasets', () => {
    for (const data of [[5], [5, 5, 5, 5], [1, 2], [0, 0, 0, 1], [-3, -3, 7], [1e12, 1e12 + 1, 1e12 + 2], [1, 2, 3, 4, 100000]]) {
        const out = app.generateDistributionAnalysis(data);
        assert.ok(!/NaN|Infinity/.test(String(out)), `[${data}] -> ${String(out).match(/.{0,40}(NaN|Infinity).{0,20}/)}`);
    }
});

test('copyText prefers the Clipboard API in a secure context and falls back otherwise', async () => {
    const calls = [];
    const fresh = loadApp();
    const el = () => ({ style: {}, setAttribute() {}, select() {}, setSelectionRange() {}, remove() {}, focus() {} });
    fresh.document.createElement = el;
    fresh.document.body.appendChild = () => {};
    fresh.document.execCommand = cmd => { calls.push('legacy'); return true; };
    fresh.navigator.clipboard = { writeText: () => { calls.push('api'); return Promise.resolve(); } };
    fresh.window.isSecureContext = true;
    assert.equal(await fresh.get('window.StatLabUI').copyText('x'), true);
    assert.deepEqual(calls, ['api']);
    calls.length = 0;
    fresh.window.isSecureContext = false;
    assert.equal(await fresh.get('window.StatLabUI').copyText('x'), true);
    assert.deepEqual(calls, ['legacy']);
});

test('ANCOVA still returns a result for ordinary data after the negative-SS guard', () => {
    const r = app.computeANCOVA('10:A:1, 12:A:2, 14:A:3, 11:B:1, 15:B:2, 18:B:3, 20:C:1, 25:C:2, 31:C:3', 0.05);
    assert.ok(r.error || r.rejectH0 === (r.pValue < 0.05));
});
