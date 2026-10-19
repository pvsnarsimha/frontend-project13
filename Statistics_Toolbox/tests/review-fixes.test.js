'use strict';
// Regression tests for the problems found in the external code review (invalid parameters, silent data loss, misleading output).
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./load-app');

const app = loadApp();
const close = (a, e, tol, msg) => assert.ok(Math.abs(a - e) <= tol, `${msg || ''} expected ${e}, got ${a}`);

test('parseValueGroupInput keeps group names that contain spaces and reports unreadable entries', () => {
    const r = app.parseValueGroupInput('2.5:Group A, 3.5:Group A, 4:Group B\n5:Group B');
    assert.deepEqual([...r.groups.keys()], ['Group A', 'Group B']);
    assert.deepEqual([...r.groups.get('Group A')], [2.5, 3.5]);
    assert.deepEqual([...r.groups.get('Group B')], [4, 5]);
    assert.equal(r.skipped.length, 0);
    const spaced = app.parseValueGroupInput('1:A 2:A 3:B 4:B');
    assert.deepEqual([...spaced.groups.get('A')], [1, 2]);
    assert.deepEqual([...spaced.groups.get('B')], [3, 4]);
    const bad = app.parseValueGroupInput('1:A, oops, 2:B, :C');
    assert.deepEqual([...bad.skipped], ['oops', ':C']);
    assert.equal(app.parseValueGroupInput('1:<b>x</b>, 2:y').groups.has('&lt;b&gt;x&lt;/b&gt;'), true, 'names are HTML-escaped');
});

test('group-comparison tools use every observation and refuse input they cannot read', () => {
    const text = '10:Low dose, 12:Low dose, 11:Low dose, 20:High dose, 22:High dose, 21:High dose';
    for (const [fn, groups] of [['computeLeveneTest', 2], ['computeBartlettTest', 2], ['computeTukeyHSD', 2], ['computeScheffeTest', 2], ['computeBonferroniCorrection', 2]]) {
        const r = app[fn](text, 0.05);
        assert.ok(!r.error, `${fn}: ${r.message}`);
        assert.ok(r.steps.includes('Low dose'), `${fn} lost the group name`);
    }
    const lost = app.computeLeveneTest('10:A, 12:A, 11:A, 20:B, 22:B, junk', 0.05);
    assert.ok(lost.error && /junk/.test(lost.message), 'unreadable entries must not be dropped silently');
});

test('validateDistributionParams rejects degenerate parameters', () => {
    const v = app.validateDistributionParams;
    assert.equal(v('normal', { mean: 0, stdDev: 1 }), null);
    assert.ok(v('normal', { mean: 0, stdDev: 0 }));
    assert.ok(v('exponential', { rate: 0 }));
    assert.ok(v('uniform', { min: 3, max: 3 }));
    assert.ok(v('beta', { alpha: 0, beta: 2 }));
    assert.ok(v('poisson', { lambda: 0 }));
    assert.equal(v('binomial', { n: 10, p: 0 }), null, 'p = 0 is fine for variance / expected value');
    assert.ok(v('binomial', { n: 10, p: 0 }, { openProbability: true }), 'but not for skewness / kurtosis / entropy');
    assert.ok(v('binomial', { n: 10, p: 1.2 }));
    assert.ok(v('binomial', { n: 2.5, p: 0.5 }));
    assert.ok(v('binomial', { n: NaN, p: 0.5 }));
});

test('hypothesis tools report invalid parameters instead of NaN / Infinity', () => {
    assert.ok(app.computeChiSquareGoodnessTest([10, 20, 30], [20, 20, 0], 0.05).error);
    assert.ok(app.computeChiSquareGoodnessTest([10, 20, 30], [20, 20, 20], 0.05).chiSquare >= 0);
    assert.ok(app.computeOneProportionZTest(5, 20, 0, 0.05, 'two.sided').error);
    assert.ok(app.computeOneProportionZTest(5, 20, 1, 0.05, 'two.sided').error);
    assert.ok(app.computeBinomialExactTest(5, 20, 1.5, 0.05, 'two.sided').error);
    assert.ok(app.computeBinomialExactTest(25, 20, 0.5, 0.05, 'two.sided').error);
    assert.ok(app.computeOneSampleZTest([1, 2, 3, 4], 2, 0, 0.05, 'two.sided').error);
});

test('Tukey HSD gives one HSD only when every pair has the same sample sizes', () => {
    const equal = app.computeTukeyHSD('1:A, 2:A, 3:A, 4:B, 5:B, 6:B, 8:C, 9:C, 10:C', 0.05);
    assert.ok(Number.isFinite(equal.hsd));
    const unequal = app.computeTukeyHSD('1:A, 2:A, 3:A, 4:B, 5:B, 6:B, 7:B, 8:C, 9:C, 10:C, 11:C, 12:C', 0.05);
    assert.equal(unequal.hsd, null);
    assert.ok(unequal.comparisons.every(c => Number.isFinite(c.hsd)));
});

test('multiple linear regression flags a singular design as an error', () => {
    const exact = [[10, 1, 2], [12, 2, 4], [15, 3, 6], [14, 4, 8], [18, 5, 10], [21, 6, 12], [22, 7, 14], [25, 8, 16]];
    const r = app.computeMultipleLinearRegression(exact);
    assert.equal(r.error, true);
    assert.match(r.message, /Cannot compute coefficients/);
    assert.match(r.steps, /Cannot compute/);
    const fine = app.computeMultipleLinearRegression([[10, 1, 2], [12, 2, 1], [15, 3, 4], [14, 4, 2], [18, 5, 5], [21, 6, 3], [22, 7, 6], [25, 8, 4]]);
    assert.ok(!fine.error);
});

test('model summary leaves points with actual = 0 out of MAPE instead of returning Infinity', () => {
    const r = app.computeModelSummary([0, 10, 20, 30, 40], [1, 11, 19, 33, 38]);
    assert.ok(!r.error, r.message);
    assert.ok(Number.isFinite(r.mape), `mape ${r.mape}`);
    close(r.mape, (1 / 10 + 1 / 20 + 3 / 30 + 2 / 40) / 4 * 100, 1e-9);
});

test('Cook\'s distance and VIF keep Infinity out of their summaries', () => {
    const vif = app.computeVIF([[1, 2, 3], [2, 4, 5], [3, 6, 4], [4, 8, 7], [5, 10, 6], [6, 12, 9]]);   // x2 = 2 * x1 → infinite VIF
    assert.ok(!vif.error, vif.message);
    assert.ok(!/Infinity/.test(vif.steps), 'VIF steps must show ∞, not "Infinity"');
    assert.ok(/N\/A \(\d predictors? with infinite VIF\)/.test(vif.steps), 'the mean VIF must say it is undefined');
    const cooks = app.computeCooksDistance([1, 2, 3, 4, 20], [2, 4, 5, 4, 30]);
    assert.ok(!cooks.error, cooks.message);
    assert.ok(!/Infinity/.test(cooks.steps));
});

// The probability tools read their inputs from the page; give them a fake one to run the beta branches.
function withFields(fields, fn) {
    const doc = app.document, original = doc.getElementById;
    doc.getElementById = id => (id in fields ? { value: String(fields[id]), style: {} } : original(id));
    try { return fn(); } finally { doc.getElementById = original; }
}

test('beta PDF, CDF and quantile worked solutions run and agree with the numeric functions', () => {
    const pdf = withFields({ pdfDistribution: 'beta', pdfXValues: '0.3, 0.7', pdfAlpha: 2, pdfBeta: 5 }, () => app.computePDFWithSteps());
    assert.ok(!pdf.error, pdf.message);
    close(pdf.results[0], app.betaPDF(0.3, 2, 5), 1e-9);
    const cdf = withFields({ cdfDistribution: 'beta', cdfXValues: '0.3, 0.7', cdfAlpha: 2, cdfBeta: 5 }, () => app.computeCDFWithSteps());
    assert.ok(!cdf.error, cdf.message);
    close(cdf.results[0], app.betaCDF(0.3, 2, 5), 1e-9);
    const q = withFields({ quantileDistribution: 'beta', quantileProbs: '0.25, 0.5, 0.9', quantileAlpha: 2, quantileBeta: 5 }, () => app.computeQuantileWithSteps());
    assert.ok(!q.error, q.message);
    close(q.results[1], app.betaQuantile(0.5, 2, 5), 1e-9);
    assert.ok(/illustration/.test(q.steps), 'the worked solution must say the Newton-Raphson steps are an illustration');
});

test('Clear buttons empty the parameter fields of the distribution tools', () => {
    const cleared = [];
    const doc = app.document, original = doc.getElementById;
    const fields = {};
    doc.getElementById = id => {
        if (!(id in fields)) fields[id] = { value: 'x', style: { display: 'block' }, addEventListener(ev, cb) { this.cb = cb; } };
        return fields[id];
    };
    try {
        for (const [setup, btn, area, ids] of [
            ['setupDistSkewnessLogic', 'distSkewnessClearBtn', 'distSkewnessResultArea', ['distSkewnessN', 'distSkewnessP']],
            ['setupDistKurtosisLogic', 'distKurtosisClearBtn', 'distKurtosisResultArea', ['distKurtosisAlpha']],
            ['setupDistributionVarianceLogic', 'varianceDistClearBtn', 'varianceDistResultArea', ['varianceDistStd', 'varianceDistMax']],
            ['setupEntropyLogic', 'entropyClearBtn', 'entropyResultArea', ['entropyLambda']],
            ['setupExpectedValueLogic', 'expectedClearBtn', 'expectedResultArea', ['expectedMean', 'expectedP']],
            ['setupMGFLogic', 'mgfClearBtn', 'mgfResultArea', ['mgfTValue', 'mgfRate']]
        ]) {
            if (typeof app[setup] !== 'function') continue;
            app[setup]();
            for (const id of ids) fields[id] = fields[id] || { value: 'x', style: {}, addEventListener() {} };
            for (const id of ids) fields[id].value = 'x';
            fields[btn].cb();
            for (const id of ids) assert.equal(fields[id].value, '', `${btn} did not clear ${id}`);
            assert.equal(fields[area].style.display, 'none');
            cleared.push(setup);
        }
    } finally { doc.getElementById = original; }
    assert.ok(cleared.length >= 4, 'expected most setup functions to be found: ' + cleared);
});
