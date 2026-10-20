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
