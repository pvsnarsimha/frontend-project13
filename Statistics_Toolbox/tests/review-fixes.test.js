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
    for (const [fn, groups] of [['computeLeveneTest', 2], ['computeBartlettTest', 2], ['computeTukeyHSD', 2], ['computeScheffeTest', 2], ['computeBonferroniCorrection', 2], ['computeANOVA', 2], ['computeKruskalWallisTest', 2], ['computeMoodsMedianTest', 2]]) {
        const r = app[fn](text, 0.05);
        assert.ok(!r.error, `${fn}: ${r.message}`);
        assert.ok(r.steps.includes('Low dose'), `${fn} lost the group name`);
    }
    for (const fn of ['computeLeveneTest', 'computeBartlettTest', 'computeTukeyHSD', 'computeScheffeTest', 'computeBonferroniCorrection', 'computeANOVA', 'computeKruskalWallisTest', 'computeMoodsMedianTest']) {
        const lost = app[fn]('10:A, 12:A, 11:A, 20:B, 22:B, junk', 0.05);
        assert.ok(lost.error && /junk/.test(lost.message), `${fn}: unreadable entries must not be dropped silently`);
    }
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

test('binomialPMF is exact for small n and stays finite for large n (C(n, k) overflows a double near n = 1030)', () => {
    close(app.binomialPMF(10, 3, 0.4), 120 * 0.4 ** 3 * 0.6 ** 7, 1e-15);
    assert.equal(app.binomialPMF(5, 0, 0), 1);
    assert.equal(app.binomialPMF(5, 5, 1), 1);
    assert.equal(app.binomialPMF(5, 6, 0.5), 0);
    close(app.binomialPMF(2000, 1000, 0.5), 0.01783901114585432, 1e-12);   // exact: C(2000,1000) / 2^2000
    let sum = 0;
    for (let k = 0; k <= 2000; k++) sum += app.binomialPMF(2000, k, 0.3);
    close(sum, 1, 1e-9, 'pmf over all k');
    assert.ok(!isFinite(app.combination(2000, 1000)), 'the raw coefficient really is out of range');
    assert.match(app.formatCombination(2000, 1000), /^≈ 10\^600\./);
    assert.equal(app.formatCombination(10, 3), '120');
    // tools built on it no longer return NaN for large n
    const exact = app.computeBinomialExactTest(1030, 2000, 0.5, 0.05, 'two.sided');
    assert.ok(!exact.error && Number.isFinite(exact.pValue) && exact.pValue > 0 && exact.pValue <= 1, `p = ${exact.pValue}`);
});

test('runs test refuses a sequence made of a single symbol', () => {
    const r = app.computeRunsTest('5 5 5 5 5 5', 0.05);
    assert.equal(r.error, true);
});

test('chartJsReady retries every racing call with that call\'s own arguments', async () => {
    const saved = { chart: app.Chart, load: app.loadChartJs };
    app.Chart = undefined;
    app.loadChartJs = () => Promise.resolve();
    const seen = [];
    const retry = (...args) => seen.push(args);
    try {
        assert.equal(app.chartJsReady(retry, ['first', 1]), false);
        assert.equal(app.chartJsReady(retry, ['second', 2]), false);
        await new Promise(r => setTimeout(r, 10));
        assert.deepEqual(seen.map(a => a[0]), ['first', 'second']);
        app.Chart = function () {};
        assert.equal(app.chartJsReady(retry, ['third']), true);
    } finally { app.Chart = saved.chart; app.loadChartJs = saved.load; }
});

// ---- Second review: wrong answers on ordinary input ----
const num = (text, re) => parseFloat(String(text).match(re)[1]);

test('every tool that reports a median agrees with Type 7 for even n (histogram, ranking, boxplot, violin)', () => {
    const data = [1, 2, 3, 4];
    assert.equal(app.quantileType7([1, 2, 3, 4], 0.5), 2.5);
    close(num(app.computeHistogramWithSteps(data, 2).steps, /Median = ([-\d.]+)/), 2.5, 1e-9, 'histogram');
    close(num(app.computeRankingWithSteps(data).steps, /Median: ([-\d.]+)/), 2.5, 1e-9, 'ranking');
    close(app.computeBoxplotWithSteps(data).median, 2.5, 1e-9, 'boxplot');
});

test('Winsorizing at 5% caps values for n = 10 and uses the same percentiles as the Percentiles tool', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const r = app.computeWinsorizeWithSteps(data, 5);
    assert.ok(!r.error, r.message);
    close(r.lowerBound, app.quantileType7(data, 0.05), 1e-12);
    close(r.upperBound, app.quantileType7(data, 0.95), 1e-12);
    assert.ok(r.cappedCount > 0, 'a 5% Winsorization of 10 values must cap something');
});

test('Z-score and Z-outlier use the same (sample) standard deviation', () => {
    const data = [2, 4, 4, 4, 5, 5, 7, 9];
    const z = app.computeZScoreWithSteps(data), o = app.computeZOutlierWithSteps(data);
    assert.equal(z.stdDev, o.stdDev);
    close(z.stdDev, Math.sqrt(32 / 7), 1e-12);
    assert.ok(app.computeZScoreWithSteps([4, 4, 4, 4]).error);
    assert.ok(app.computeZOutlierWithSteps([4, 4, 4, 4]).error);
});

test('stem-and-leaf keeps every digit: stem and leaf rebuild the value (large range, negatives, decimals)', () => {
    const rebuild = (values, unit) => {
        const r = app.computeStemLeafWithSteps(values);
        assert.ok(!r.error, r.message);
        for (const pt of r.scatterData) close(pt.stem * unit + pt.y, unit === 0.1 ? Math.round(pt.x * 10) / 10 * 10 / 10 * 1 : Math.floor(pt.x), unit === 0.1 ? 0.051 : 1e-9, `value ${pt.x}`);
    };
    rebuild([100, 1234, 2500, 3999], 100);
    rebuild([-15, -5, 3, 12, 27], 10);
    rebuild([1, 2, 3, 150], 10);
    const tenths = app.computeStemLeafWithSteps([0.12, 0.37, 0.55, 0.96]);
    assert.ok(tenths.scatterData.every(pt => pt.y >= 0 && pt.y <= 9), 'a leaf can never be 10');
});

test('adjusted R² in the model summary follows the number of predictors k', () => {
    const x = [1, 2, 3, 4, 5, 6, 7, 8], y = [2.1, 3.9, 6.2, 7.8, 10.1, 12.3, 13.8, 16.2];
    const fit = app.computeSimpleLinearRegression(x, y);
    const pred = x.map(v => fit.intercept + fit.slope * v);
    const k1 = app.computeModelSummary(y, pred, 1);
    close(k1.adjRSquared, fit.adjRSquared, 1e-12, 'k = 1 matches simple linear regression');
    const k2 = app.computeModelSummary(y, pred, 2);
    close(k2.adjRSquared, 1 - (1 - k2.rSquared) * 7 / 5, 1e-12, 'k = 2 uses n - k - 1 = 5');
    assert.ok(app.computeModelSummary(y, pred, 7).error, 'k must leave residual degrees of freedom');
    assert.ok(app.computeModelSummary([5, 5, 5, 5], [5, 5, 5, 5], 1).error, 'R² is undefined for constant actuals');
});

test('simple-regression tools reject a constant predictor instead of returning NaN, Infinity or a false "no effect"', () => {
    for (const fn of ['computeSimpleLinearRegression', 'computeStdErrorsWithSteps', 'computeTStatsWithSteps']) {
        assert.equal(app[fn]([1, 1, 1, 1, 1], [2, 3, 4, 5, 6]).error, true, fn);
    }
    assert.equal(app.computeFTestOverallWithSteps([1, 1, 1, 1, 1], [2, 3, 4, 5, 6], 0.05).error, true);
    // the shared core agrees with the tools
    const x = [1, 2, 4, 5, 7], y = [2, 3, 7, 8, 12];
    const core = app.simpleRegressionCore(x, y), se = app.computeStdErrorsWithSteps(x, y), t = app.computeTStatsWithSteps(x, y);
    close(se.seSlope, core.seSlope, 1e-12); close(t.tSlope, core.slope / core.seSlope, 1e-12);
    assert.equal(app.simpleRegressionCore([3, 3, 3], [1, 2, 3]), null);
});

test('multiple regression accepts a well-posed design with predictors far from zero, and rejects ragged rows', () => {
    const rows = [];
    for (let i = 0; i < 10; i++) { const x = 1e6 + i, z = (i * 7) % 5; rows.push([3 + 0.5 * (x - 1e6) + z * 1.3 + ((i * 13) % 3) * 0.2, x, z]); }
    const r = app.computeMultipleLinearRegression(rows);
    assert.ok(!r.error, r.message);
    close(r.coefficients[1], 0.50258065, 1e-6); close(r.coefficients[2], 1.30870968, 1e-6);   // numpy.linalg.lstsq
    close(r.coefficients[0], -502577.4941935, 1e-3);
    assert.ok(app.computeMultipleLinearRegression([[1, 2], [3, 4, 5], [6, 7], [8, 9]]).error);
});

test('the Q-Q plot takes its normal quantiles from normInv (matches SciPy)', () => {
    const r = app.computeQQPlotWithSteps(Array.from({ length: 20 }, (_, i) => i + 1));
    r.theoreticalQuantiles.forEach((z, i) => close(z, app.normInv((i + 1 - 0.375) / 20.25), 1e-12));
    close(r.correlation, 0.9885258484288462, 1e-9);      // scipy: corrcoef(norm.ppf((i - 0.375)/(n + 0.25)), 1..20)
    assert.ok(app.computeQQPlotWithSteps([1, 2]).error, 'two points always correlate perfectly');
    assert.ok(app.computeQQPlotWithSteps([4, 4, 4, 4]).error);
    assert.ok(app.computePPPlotWithSteps([1, 2], 'normal').error);
    assert.ok(app.computePPPlotWithSteps([0, 0, 0], 'exponential').error);
});

test('normality tests refuse constant data instead of failing to reject', () => {
    for (const [fn, arg] of [['computeShapiroWilkTest', [4, 4, 4, 4, 4, 4]], ['computeAndersonDarlingTest', [4, 4, 4, 4, 4, 4]], ['computeKolmogorovSmirnovTest', [4, 4, 4, 4, 4, 4]]]) {
        assert.equal(app[fn](arg, 0.05).error, true, fn);
    }
});

test('PMF validates its parameters and shows huge factorials without "Infinity"', () => {
    const bad = withFields({ pmfDistribution: 'poisson', pmfXValues: '1, 2', pmfLambda: -1 }, () => app.computePMFWithSteps());
    assert.equal(bad.error, true);
    const badBinomial = withFields({ pmfDistribution: 'binomial', pmfXValues: '1', pmfN: 10, pmfP: 1.5 }, () => app.computePMFWithSteps());
    assert.equal(badBinomial.error, true);
    const big = withFields({ pmfDistribution: 'poisson', pmfXValues: '200', pmfLambda: 200 }, () => app.computePMFWithSteps());
    assert.ok(!big.error && !/Infinity/.test(big.steps), 'k! for k > 170 is shown as a power of ten');
});

test('Cochran Q, Mood\'s median, McNemar and goodness-of-fit report what they exclude or scale', () => {
    const cq = app.computeCochranQTest('1, 0, 1\n1, 2, 0\n0, 1, 1\n1, 1, 1', 0.05);
    assert.ok(cq.error && /Row 2/.test(cq.message), 'a non-binary row is rejected by name');
    const mm = app.computeMoodsMedianTest('1:A, 2:A, 3:A, 4:B, 5:B, 6:B, 3:B', 0.05);
    assert.ok(!mm.error, mm.message);
    assert.ok(mm.excluded >= 1, 'values equal to the overall median are counted');
    assert.equal(app.computeMcNemarTest('10 5 5 10', 0.05).chiSquare, 0, 'continuity correction never goes below 0');
    close(app.computeChiSquareGoodnessTest([50, 30, 20], [0.4, 0.3, 0.3], 0.05).chiSquare, app.computeChiSquareGoodnessTest([50, 30, 20], [40, 30, 30], 0.05).chiSquare, 1e-12, 'proportions are scaled to counts');
});

test('category names that look like object keys (__proto__) do not corrupt the contingency tools', () => {
    const t = '__proto__, x\n__proto__, y\nb, x\nb, y\nb, x\n__proto__, x';
    const renamed = t.replace(/__proto__/g, 'a');
    close(app.computeChisquareWithSteps(t).chiSquare, app.computeChisquareWithSteps(renamed).chiSquare, 1e-12);
    close(app.computeCramersVWithSteps(t).cramersV, app.computeCramersVWithSteps(renamed).cramersV, 1e-12);
    assert.deepEqual([...app.computeContingencyTableWithSteps(t).rowCategories].sort(), ['__proto__', 'b']);
});

test('shared distribution moments match SciPy and every moment tool reads them', () => {
    const ref = {
        normal: [{ mean: 3, stdDev: 2 }, 3, 4, 0, 0], exponential: [{ rate: 0.5 }, 2, 4, 2, 6], uniform: [{ min: 2, max: 8 }, 5, 3, 0, -1.2],
        beta: [{ alpha: 2, beta: 5 }, 0.2857142857142857, 0.025510204081632654, 0.5962847939999439, -0.12],
        poisson: [{ lambda: 4.5 }, 4.5, 4.5, 0.4714045207910317, 0.2222222222222222], binomial: [{ n: 20, p: 0.3 }, 6, 4.2, 0.19518001458970663, -0.06190476190476191]
    };
    for (const [dist, [params, mean, variance, skewness, kurtosis]] of Object.entries(ref)) {
        const m = app.distributionMoments(dist, params);
        close(m.mean, mean, 1e-12, dist + ' mean'); close(m.variance, variance, 1e-12, dist + ' variance');
        close(m.skewness, skewness, 1e-12, dist + ' skewness'); close(m.kurtosis, kurtosis, 1e-12, dist + ' kurtosis');
        close(app.computeExpectedValueWithSteps(dist, params).expectedValue, mean, 1e-12);
        close(app.computeDistributionVarianceWithSteps(dist, params).variance, variance, 1e-12);
        if (dist !== 'normal' || true) {
            close(app.computeDistSkewnessWithSteps(dist, params).skewness, skewness, 1e-12);
            close(app.computeDistKurtosisWithSteps(dist, params).kurtosis, kurtosis, 1e-12);
        }
    }
});

test('distribution fit, entropy, hazard and survival handle degenerate input', () => {
    assert.equal(app.computeFitDistributionWithSteps([4, 4, 4, 4], 'normal').error, true);
    assert.equal(app.computeFitDistributionWithSteps([4, 4, 4, 4], 'uniform').error, true);
    assert.equal(app.computeFitDistributionWithSteps([-1, 2, 3], 'exponential').error, true);
    const t0 = Date.now();
    const h = app.computeEntropyWithSteps('poisson', { lambda: 1e10 });
    assert.ok(Number.isFinite(h.entropy) && Date.now() - t0 < 1000, 'huge λ uses the asymptotic expansion');
    close(app.computeEntropyWithSteps('poisson', { lambda: 20 }).entropy, 2.912526400182312, 1e-9);        // scipy.stats.poisson(20).entropy()
    close(app.computeEntropyWithSteps('binomial', { n: 100, p: 0.3 }).entropy, 2.940540474235668, 1e-9);   // scipy.stats.binom(100, .3).entropy()
    const exp = withFields({ hazardDistribution: 'exponential', hazardXValues: '1000', hazardRate: 1 }, () => app.computeHazardWithSteps());
    assert.ok(!exp.error && !/NaN/.test(exp.steps), 'h(t) = λ even when f and S underflow');
    assert.equal(withFields({ hazardDistribution: 'weibull', hazardXValues: '1', hazardShape: 0, hazardScale: 2 }, () => app.computeHazardWithSteps()).error, true);
    assert.equal(withFields({ survivalDistribution: 'weibull', survivalXValues: '1', survivalShape: 2, survivalScale: -1 }, () => app.computeSurvivalWithSteps()).error, true);
});

test('t tests and the overall F test report an error instead of a decision when the data has no variation or overflows', () => {
    const same = [4, 4, 4, 4, 4, 4];
    assert.equal(app.computePairedTTest(same, same, 0.05, 'two.sided').error, true, 'identical differences (sd = 0)');
    assert.equal(app.computeOneSampleTTest(same, 0, 0.05, 'two.sided').error, true, 'constant sample (sd = 0)');
    assert.equal(app.computeOneSampleTTest([1e308, 1e308, 1e308], 0, 0.05, 'two.sided').error, true, 'sums overflow');
    assert.equal(app.computePairedTTest([1e308, 1e308, 1e308], [0, 1, 2], 0.05, 'two.sided').error, true);
    assert.equal(app.computeFTestOverallWithSteps([1, 2, 3, 4, 5], [1, 2, 3, 4, 5], 0.05).error, true, 'perfect fit: MSE = 0');
    assert.equal(app.computeFTestOverallWithSteps([1, 2, 3, 4, 5], [7, 7, 7, 7, 7], 0.05).error, true, 'constant Y');
    // ordinary data is unaffected
    close(app.computeOneSampleTTest([1, 2, 3, 4, 5], 2, 0.05, 'two.sided').tStatistic, Math.sqrt(2), 1e-12);
    assert.ok(Number.isFinite(app.computeFTestOverallWithSteps([1, 2, 3, 4, 5], [2, 4, 5, 4, 5], 0.05).fStatistic));
});

test('binomialPMF is accurate at n = 1000 (direct product) and just above it (log space), against SciPy', () => {
    close(app.binomialPMF(1000, 500, 0.5), 0.025225018178360804, 1e-12);      // scipy.stats.binom.pmf(500, 1000, 0.5)
    close(app.binomialPMF(1000, 300, 0.3), 0.027521003821268382, 1e-12);
    close(app.binomialPMF(800, 400, 0.5), 0.028200665094712345, 1e-12);
    // C(1001, 500) / C(1000, 500) = 1001 / 501, so the pmf ratio across the switch between the two methods is exactly (1001 / 501) / 2
    close(app.binomialPMF(1001, 500, 0.5) / app.binomialPMF(1000, 500, 0.5), 1001 / 501 / 2, 1e-10, 'the two methods join smoothly');
});

test('setHtml without a real <template> (no DOM) still strips event handlers', () => {
    const doc = app.document, original = doc.createElement;
    doc.createElement = tag => tag === 'template' ? { innerHTML: '', content: null } : original(tag);
    try {
        const el = { innerHTML: '' };
        app.setHtml(el, '<a href="#" onclick="steal()" class="k">x</a><img src=x onerror=boom()>');
        assert.ok(!/onclick|onerror/i.test(el.innerHTML), el.innerHTML);
        assert.match(el.innerHTML, /class="k"/);
    } finally { doc.createElement = original; }
});

test('no tool string contains double-encoded UTF-8 (mojibake) sequences', () => {
    const fs = require('fs'), path = require('path');
    const ROOT = path.join(__dirname, '..');
    const bad = /рџ|в”Ѓ|ОЈ|в€љ|М„|Ã¢â|â€[™œ“”¦]|Ã[©¨ ]|Â[²°·]/;
    const walk = d => fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).flatMap(e => e.isDirectory() ? (e.name === 'node_modules' || e.name === 'vendor' ? [] : walk(d + '/' + e.name)) : [d + '/' + e.name]);
    const offenders = ['js', 'css', 'tests'].flatMap(walk).filter(f => /\.(js|css|html|md)$/.test(f) && !f.endsWith('review-fixes.test.js') && bad.test(fs.readFileSync(path.join(ROOT, f), 'utf8')));
    assert.deepEqual(offenders, [], 'files with garbled text (re-save as UTF-8)');
});

test('parseValueGroupInput keeps digits that belong to a group name', () => {
    const a = app.parseValueGroupInput('1:Group 2, 2:Group 2, 3:Group 10');
    assert.deepEqual([...a.groups.keys()], ['Group 2', 'Group 10']);
    assert.deepEqual([...a.groups.get('Group 2')], [1, 2]);
    const b = app.parseValueGroupInput('1:A 1 2:A 1');
    assert.deepEqual([...b.groups.keys()], ['A 1']);
    assert.deepEqual([...b.groups.get('A 1')], [1, 2]);
});

test('third review: entropy never negative for discrete distributions, Beta draws never underflow, summaries never print Infinity', () => {
    for (const [dist, params] of [['binomial', { n: 1, p: 1e-300 }], ['binomial', { n: 5, p: 1e-200 }], ['poisson', { lambda: 1e-12 }]]) {
        const h = app.computeEntropyWithSteps(dist, params);
        assert.ok(h.entropy >= 0 && !Object.is(h.entropy, -0), `${dist}: ${h.entropy}`);
        assert.ok(!/-0\.00000000/.test(h.steps), 'no "-0.00000000" in the worked solution');
    }
    assert.ok(app.computeEntropyWithSteps('normal', { stdDev: 0.01 }).entropy < 0, 'a differential entropy may be negative');
    const source = app.createRandomSource(2024);
    for (const [alpha, beta] of [[0.001, 0.001], [0.001, 5], [0.3, 0.3], [2, 5]]) {
        const xs = app.generateRandomNumbers(2000, 'beta', { alpha, beta }, source);
        assert.ok(xs.every(v => Number.isFinite(v) && v >= 0 && v <= 1), `Beta(${alpha}, ${beta}) produced a non-finite draw`);
        close(xs.reduce((s, v) => s + v, 0) / xs.length, alpha / (alpha + beta), 0.03, `Beta(${alpha}, ${beta}) mean`);
    }
    const cooks = app.computeCooksDistance([1, 2, 3, 4, 20], [2, 4, 5, 4, 30]);
    assert.ok(!/Infinity|NaN/.test(cooks.steps), "Cook's D summary rows show ∞ instead of Infinity");
});

test('third review: perfect fits and constant Y are reported, not turned into t = Infinity or a bogus decision', () => {
    const x = [1, 2, 3, 4, 5], perfect = [2, 4, 6, 8, 10], constant = [7, 7, 7, 7, 7];
    for (const fn of ['computeStdErrorsWithSteps', 'computeTStatsWithSteps']) {
        assert.equal(app[fn](x, perfect).error, true, `${fn}: perfect fit`);
        assert.equal(app[fn](x, constant).error, true, `${fn}: constant Y`);
    }
    assert.equal(app.computeSimpleLinearRegression(x, constant).error, true);
    const ok = app.computeSimpleLinearRegression(x, perfect);
    assert.ok(!ok.error && Math.abs(ok.slope - 2) < 1e-12, 'a perfect line still has a well-defined slope');
    const cooks = app.computeCooksDistance(x, perfect);
    assert.equal(cooks.perfectFit, true);
    assert.ok(/fits the data perfectly/.test(cooks.steps));
    assert.equal(app.computeCooksDistance(x, [2, 4, 5, 4, 5]).perfectFit, false);
});

test('third review: multiple regression explains why a design failed', () => {
    const exact = [[10, 1, 2], [12, 2, 4], [15, 3, 6], [14, 4, 8], [18, 5, 10], [21, 6, 12], [22, 7, 14], [25, 8, 16]];
    const r = app.computeMultipleLinearRegression(exact);
    assert.ok(r.error && /exact copy or linear combination/.test(r.steps), 'an exactly dependent predictor gets the multicollinearity advice');
});

test('third review: legacy "Visualize Data" charts use the Boxplot and Histogram tools\' statistics', () => {
    const fs = require('fs'), path = require('path');
    const ROOT = path.join(__dirname, '..');
    const boxplot = fs.readFileSync(path.join(ROOT, 'js/tools/preparation/boxplot-chart.js'), 'utf8');
    const histogram = fs.readFileSync(path.join(ROOT, 'js/tools/preparation/histogram.js'), 'utf8');
    assert.match(boxplot, /computeBoxplotWithSteps\(numbers\)/);
    assert.match(histogram, /computeHistogramWithSteps\(numbers, numBins\)/);
    assert.ok(!/q1 - 1\.5 \* iqr\)/.test(boxplot.slice(0, boxplot.indexOf('function renderBoxplotChart'))), 'no second whisker formula in the legacy box plot');
    assert.ok(!/← CHANGE/.test(boxplot), 'no leftover debug comments');
    assert.ok(!/ - 15,|\+ 15\s*$/m.test(boxplot.slice(boxplot.indexOf('min: Math.min(minVal'), boxplot.indexOf('min: Math.min(minVal') + 200)), 'y-axis padding is a share of the range, not 15 data units');
});

test('the median is identical in every tool that reports one (even n, unequal middle values)', () => {
    for (const data of [[1, 2, 4, 9, 10, 40], [3, 1, 2, 8], [5, 3, 9]]) {
        const sorted = [...data].sort((a, b) => a - b);
        const expected = app.quantileType7(sorted, 0.5);
        const seen = {
            median: app.computeMedianWithSteps(data).value, fivenum: app.computeFiveNumWithSteps(data).median,
            quartiles: app.computeQuartilesWithSteps(data).q2, boxplot: app.computeBoxplotWithSteps(data).median,
            violin: app.computeViolinWithSteps(data, 0.5).median,
            iqr: num(app.computeIQRWithSteps(data).steps, /median \(Q₂\) = ([-\d.]+)/),
            histogram: num(app.computeHistogramWithSteps(data, 2).steps, /Median = ([-\d.]+)/),
            ranking: num(app.computeRankingWithSteps(data).steps, /Median: ([-\d.]+)/)
        };
        for (const [tool, value] of Object.entries(seen)) close(value, expected, 1e-9, `${tool} median of [${data}]`);
        // MAD is the median of |x - median|, taken with the same median
        close(app.computeMedianAbsDevWithSteps(data).value, app.quantileType7(sorted.map(v => Math.abs(v - expected)).sort((a, b) => a - b), 0.5), 1e-9, 'MAD');
    }
    // and no tool carries its own copy of the median arithmetic any more
    const fs = require('fs'), path = require('path');
    const dir = path.join(__dirname, '..', 'js', 'tools');
    const offenders = fs.readdirSync(dir).flatMap(m => fs.readdirSync(path.join(dir, m)).map(f => `${m}/${f}`)).filter(f => /(getMedian|\(sorted\[n\/2 - 1\] \+ sorted\[n\/2\]\) \/ 2|allValues\[n\/2 - 1\])/.test(fs.readFileSync(path.join(dir, f), 'utf8')));
    assert.deepEqual(offenders, []);
});

test('inference tools accept data on a tiny scale (the perfect-fit check is relative to the data, not an absolute floor)', () => {
    const x = [1, 2, 3, 4, 5];
    for (const y of [[1e-6, 2.1e-6, 2.9e-6, 4.2e-6, 4.8e-6], [1, 1.0001, 1.0003, 1.0002, 1.0005]]) {
        for (const fn of ['computeStdErrorsWithSteps', 'computeTStatsWithSteps']) assert.ok(!app[fn](x, y).error, `${fn} rejected valid data ${y}`);
        assert.ok(!app.computeFTestOverallWithSteps(x, y, 0.05).error);
    }
});

test('a seeded random source is reproducible and independent of other sources', () => {
    const a1 = app.createRandomSource(7), a2 = app.createRandomSource(7), b = app.createRandomSource(8);
    const draw = s => Array.from({ length: 5 }, () => s.uniform());
    const first = draw(a1);
    draw(b);                                  // drawing from another source does not disturb this one
    assert.deepEqual(draw(a2), first);
    assert.notDeepEqual(draw(app.createRandomSource(8)), first);
});
