'use strict';
// The same data must give the same quartile, IQR, median and skewness in every tool that shows one.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadApp, scriptList, ROOT } = require('./load-app');

const app = loadApp();
const close = (a, b, tol = 1e-9, msg = '') => assert.ok(Math.abs(a - b) <= tol, `${msg} ${a} vs ${b}`);

const DATASETS = [
    [3, 7, 8, 5, 12, 14, 21, 13, 18, 40],
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [2.5, 3.1, 4.7, 4.7, 9.9, 10.2],
    [10, 20, 30, 40],
    [5, 1, 9, 3, 7, 100, 2]
];

test('quartiles, IQR and median agree across Quartiles, IQR, Boxplot, IQR-outlier, Median and Percentiles', () => {
    for (const d of DATASETS) {
        const sorted = [...d].sort((a, b) => a - b);
        const q1 = app.quantileType7(sorted, 0.25), med = app.quantileType7(sorted, 0.5), q3 = app.quantileType7(sorted, 0.75);
        const quart = app.computeQuartilesWithSteps(d.slice());
        close(quart.q1, q1, 1e-9, 'quartiles Q1'); close(quart.q2, med, 1e-9, 'quartiles Q2'); close(quart.q3, q3, 1e-9, 'quartiles Q3');
        close(app.computeIQRWithSteps(d.slice()).value, q3 - q1, 1e-9, 'IQR tool');
        const box = app.computeBoxplotWithSteps(d.slice());
        close(box.q1, q1, 1e-9, 'boxplot Q1'); close(box.median, med, 1e-9, 'boxplot median'); close(box.q3, q3, 1e-9, 'boxplot Q3'); close(box.iqr, q3 - q1, 1e-9, 'boxplot IQR');
        const out = app.computeIQROutlierWithSteps(d.slice());
        close(out.q1, q1, 1e-9, 'outlier Q1'); close(out.q3, q3, 1e-9, 'outlier Q3'); close(out.iqr, q3 - q1, 1e-9, 'outlier IQR');
        close(app.computeMedianWithSteps(d.slice()).value, med, 1e-9, 'median tool');
        const pct = app.computePercentilesWithSteps(d.slice(), [25, 50, 75]).results;
        close(pct[25], q1, 1e-9, 'percentile 25'); close(pct[50], med, 1e-9, 'percentile 50'); close(pct[75], q3, 1e-9, 'percentile 75');
    }
});

test('the stem-and-leaf plot reports the same median as the Median tool', () => {
    for (const d of DATASETS) {
        const med = app.computeMedianWithSteps(d.slice()).value;
        const text = app.computeStemLeafWithSteps(d.slice()).steps;
        const m = text.match(/Median = (-?[\d.]+)/);
        assert.ok(m, 'stem-and-leaf prints a median');
        close(parseFloat(m[1]), med, 5e-5, 'stem-leaf median');
    }
});

test('skewness and kurtosis agree across the Skewness / Kurtosis tools, Boxplot and Violin', () => {
    for (const d of DATASETS.filter(x => x.length >= 4)) {
        const g1 = app.computeSkewnessWithSteps(d.slice()).skewness;
        const g2 = app.computeKurtosisWithSteps(d.slice()).kurtosis;
        close(app.sampleSkewness(d), g1, 1e-9, 'helper skewness'); close(app.sampleExcessKurtosis(d), g2, 1e-9, 'helper kurtosis');
        close(app.computeBoxplotWithSteps(d.slice()).skewness, g1, 1e-9, 'boxplot skewness');
        const v = app.computeViolinWithSteps(d.slice(), 1);
        assert.ok(!v.error, v.message);
        close(v.skewness, g1, 1e-9, 'violin skewness'); close(v.kurtosis, g2, 1e-9, 'violin kurtosis');
    }
    assert.equal(app.sampleSkewness([1, 2]), null);
    assert.equal(app.sampleSkewness([4, 4, 4]), null);
    assert.equal(app.sampleExcessKurtosis([1, 2, 3]), null);
});

test('stem-and-leaf keeps the tenths digit of decimal data', () => {
    const r = app.computeStemLeafWithSteps([12.3, 12.7, 13.1, 14.8, 15.0, 18.2]);
    assert.ok(/Key: \d+ \| 7 means \d+\.7/.test(r.steps), 'key explains tenths leaves');
    assert.notDeepEqual(r.stemMap.get(12), [2, 2], 'two different decimals do not collapse to the same leaf');
});

test('every source file is valid UTF-8 without mojibake (double-encoded text) or replacement characters', () => {
    const files = [...scriptList(), 'Statistics.html', 'README.md', 'css/statlab.css', 'css/tool-panels.css', 'css/responsive.css'];
    const mojibake = /â€|Ã[\u0080-¿]|ðŸ|�/;
    const bad = [];
    for (const rel of files) {
        const buf = fs.readFileSync(path.join(ROOT, rel));
        const text = new TextDecoder('utf-8', { fatal: true }).decode(buf);      // throws on invalid UTF-8
        if (mojibake.test(text)) bad.push(rel);
    }
    assert.deepEqual(bad, []);
});

test('no source file contains Cyrillic letters (the signature of double-encoded UTF-8 emoji), and the four named tools keep their real symbols', () => {
    const files = scriptList();
    const bad = [];
    for (const rel of files) {
        const text = fs.readFileSync(path.join(ROOT, rel), 'utf8');
        if (/[Ѐ-ӿ]/.test(text)) bad.push(rel);
    }
    assert.deepEqual(bad, []);
    for (const rel of ['js/tools/preparation/z-score.js', 'js/tools/probability/pdf.js', 'js/tools/probability/survival.js', 'js/tools/probability/hazard.js']) {
        const text = fs.readFileSync(path.join(ROOT, rel), 'utf8');
        assert.ok(/📊|📉|📌/.test(text), `${rel} has its emoji`);
        assert.ok(/[━╔║]/.test(text) || /Σ|√|x̄/.test(text), `${rel} has its box-drawing / math symbols`);
    }
});

test('sum of squares: group names with spaces, unreadable tokens reported, single-group note', () => {
    const r = app.computeSumSquaresWithSteps('1:Group A 2:Group A 5:Group B 7:Group B');
    assert.ok(!r.error, r.message);
    assert.ok(r.hasGroups && /Group A/.test(r.steps) && /Group B/.test(r.steps));
    close(r.totalSS, 22.75, 1e-9, 'total'); close(r.withinSS, 0.5 + 2, 1e-9, 'within'); close(r.betweenSS, 22.75 - 2.5, 1e-9, 'between');
    const bad = app.computeSumSquaresWithSteps('1:A, junk, 2:B');
    assert.ok(bad.error && /junk/.test(bad.message), bad.message);
    const one = app.computeSumSquaresWithSteps('3, 5, 7');
    assert.ok(!one.hasGroups && /no between-group component/.test(one.steps));
});

test('coefficient of variation: a zero mean is an error, not Infinity%', () => {
    const r = app.computeCVWithSteps([-1, 1]);
    assert.ok(r.error && !/Infinity|NaN/.test(r.message));
    close(app.computeCVWithSteps([10, 20, 30]).cv, 100 * Math.sqrt(200 / 3) / 20, 1e-9);
});

test('geometric mean of very small and very large positives does not underflow or overflow', () => {
    const tiny = app.computeGeometricWithSteps([1e-200, 1e-200, 1e-200]);
    assert.ok(Math.abs(tiny.value / 1e-200 - 1) < 1e-9, String(tiny.value));
    const many = app.computeGeometricWithSteps(Array(100).fill(0.0001));
    assert.ok(Math.abs(many.value / 1e-4 - 1) < 1e-9, String(many.value));
    const big = app.computeGeometricWithSteps([1e200, 1e200, 1e200]);
    assert.ok(Math.abs(big.value / 1e200 - 1) < 1e-9);
    close(app.computeGeometricWithSteps([2, 8, 4]).value, 4, 1e-12);
});

test('variance and standard deviation reject a single value inside the compute function', () => {
    assert.ok(app.computeVarianceWithSteps([5]).error);
    assert.ok(app.computeStdDevWithSteps([5]).error);
    assert.ok(!app.computeVarianceWithSteps([5, 7]).error);
});

test('ranking: 0 is a real second-smallest value, not N/A', () => {
    const r = app.computeRankingWithSteps([0, 0, 1]);
    assert.ok(/2nd smallest: 0\n/.test(r.steps), r.steps);
    assert.ok(/2nd largest: 0\n/.test(r.steps));
});

test('Box-Cox: a cleared or non-numeric custom lambda is an error; skewness matches the Skewness tool', () => {
    assert.ok(app.computeBoxCoxWithSteps([1, 2, 3, 4, 10], 'custom', NaN).error);
    assert.ok(app.computeBoxCoxWithSteps([1, 2, 3, 4, 10], 'custom', null).error);
    const d = [1, 2, 3, 4, 10, 25];
    const r = app.computeBoxCoxWithSteps(d, 'custom', 1);
    close(r.origSkew, app.computeSkewnessWithSteps(d.slice()).skewness, 1e-9, 'Box-Cox original skewness');
});

test('Visualize Data summary shows the Skewness / Kurtosis tools\' estimators next to the population ones', () => {
    const d = [3, 7, 8, 5, 12, 14, 21, 13, 18, 40];
    const text = app.generateDistributionAnalysis(d);
    assert.ok(text.includes(app.computeSkewnessWithSteps(d.slice()).skewness.toFixed(4)));
    assert.ok(text.includes(app.computeKurtosisWithSteps(d.slice()).kurtosis.toFixed(4)));
});

test('Cook\'s D perfect-fit rule is relative (units of y do not matter)', () => {
    for (const scale of [1, 1e-9, 1e9]) {
        const r = app.computeCooksDistance([1, 2, 3, 4, 5], [2, 4, 6, 8, 10].map(v => v * scale));
        assert.equal(r.perfectFit, true, `scale ${scale}`);
    }
    assert.equal(app.computeCooksDistance([1, 2, 3, 4, 5], [2.1, 3.9, 6.2, 7.8, 10.3]).perfectFit, false);
});

test('sign test: "less" is the mirror image of "greater" (data mostly above M0 gives no support for median < M0)', () => {
    const A = [12.1, 9.8, 14.2, 11.5, 10.9, 13.3, 15.0, 9.1, 12.7, 11.0];
    const mirrored = A.map(v => 22 - v);                        // reflect about M0 = 11
    close(app.computeSignTest(A, 11, 0.05, 'less').pValue, app.computeSignTest(mirrored, 11, 0.05, 'greater').pValue, 1e-12);
    close(app.computeSignTest(A, 11, 0.05, 'greater').pValue, 0.25390625, 1e-12);   // 6 of 9 above: P(X >= 6)
    close(app.computeSignTest(A, 11, 0.05, 'less').pValue, 0.91015625, 1e-12);      // P(X <= 6) = 1 - P(X >= 7)
});

test('Beta(1000, 1000) and other very peaked Betas generate quickly with the right mean (density in log space)', () => {
    close(app.betaPDF(0.5, 1000, 1000), 35.68, 0.05, 'density at the mode of Beta(1000,1000)');
    assert.ok(Number.isFinite(app.betaPDF(0.5, 1e5, 1e5)));
    for (const [a, b] of [[1000, 1000], [1e5, 1e5], [5000, 10]]) {
        const els = { randomDistribution: { value: 'beta' }, randomCount: { value: '500' }, randomAlpha: { value: String(a) }, randomBeta: { value: String(b) }, randomSeed: { value: '' } };
        const probe = loadApp();
        probe.document.getElementById = id => els[id] || { value: '', style: {} };
        const t0 = Date.now();
        const r = probe.computeRandomWithSteps();
        assert.ok(Date.now() - t0 < 1500, `Beta(${a}, ${b}) took ${Date.now() - t0} ms`);
        const mean = r.randomNumbers.reduce((s, v) => s + v, 0) / r.randomNumbers.length;
        const sd = Math.sqrt(a * b / ((a + b) ** 2 * (a + b + 1)));
        assert.ok(Math.abs(mean - a / (a + b)) < 5 * sd / Math.sqrt(500) + 1e-9, `mean ${mean}`);
    }
});

test('stem-and-leaf scatter chart Y axis is not capped at 10 (two-digit leaves)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'js/tools/preparation/stem-leaf.js'), 'utf8');
    assert.ok(!/max: 10\s*\n/.test(src) && /Math\.max\(10, \.\.\.sortedData/.test(src));
    const r = app.computeStemLeafWithSteps([100, 250, 399, 520, 1043, 1999]);
    assert.ok(Math.max(...r.scatterData.map(p => p.y)) >= 43);
    assert.ok(!/10<sup>⌊log₁₀\(Range\)⌋/.test(r.steps), 'the displayed rule matches the code (no log10 formula)');
});

test('hazard (exponential, huge λt): the symbolic Step 3 is actually printed', () => {
    const els = { hazardDistribution: { value: 'exponential' }, hazardXValues: { value: '1000' }, hazardRate: { value: '5' } };
    const probe = loadApp();
    probe.document.getElementById = id => els[id] || { value: '', style: {} };
    const r = probe.computeHazardWithSteps();
    assert.ok(!r.error, r.message);
    assert.ok(/Step 3: f\(1000\) and S\(1000\) are both smaller/.test(r.steps), r.steps);
});

test('Scheffé returns one critical difference only when every pair has the same one', () => {
    const equal = app.computeScheffeTest('1:A, 2:A, 3:A, 5:B, 6:B, 7:B, 9:C, 10:C, 12:C', 0.05);
    assert.ok(Number.isFinite(equal.scheffeCritical));
    const unequal = app.computeScheffeTest('1:A, 2:A, 3:A, 4:A, 5:B, 6:B, 7:B, 9:C, 10:C', 0.05);
    assert.equal(unequal.scheffeCritical, null);
    assert.ok(unequal.scheffeValues.length === 3);
});

test('every tool title is readable text (no Cyrillic, no mojibake letters), including Z-scores and the hazard function', () => {
    const renderers = Object.keys(app).filter(k => /^render.+Interface$/.test(k) && typeof app[k] === 'function');
    assert.ok(renderers.includes('renderZScoreInterface') && renderers.includes('renderHazardInterface'), 'the Z-score and hazard tools are among the checked renderers');
    assert.ok(renderers.length >= 90, `expected every tool to be checked, found ${renderers.length}`);
    for (const fn of renderers) {
        const html = app[fn]();
        const title = html.match(/<div class="interface-title">([^<]*)<\/div>/);
        if (!title) { assert.ok(!/[\u0400-\u04FF]/.test(html), `${fn} has Cyrillic letters`); continue; }       // a few tools build their own heading: still no Cyrillic
        const text = title[1];
        assert.ok(!/[\u0400-\u04FF]/.test(text), `${fn} title has Cyrillic letters (double-encoded UTF-8): ${text}`);
        assert.ok(!/Ã|â€|Ž|╬|ŌłÆ|┬/.test(text), `${fn} title has mojibake: ${text}`);
        assert.ok(/[A-Za-z]{3,}/.test(text), `${fn} title has readable words: ${text}`);
    }
    assert.match(app.renderZScoreInterface(), /interface-title">📊 Standardization/);
    assert.match(app.renderHazardInterface(), /interface-title">⚠️ Hazard Function/);
});
