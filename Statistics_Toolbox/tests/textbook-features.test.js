'use strict';
// The textbook-question features: summary-statistics input, the Probability Calculator, grouped data, the density functions
// behind the graphs, and the chart specs of the hypothesis tests. Reference values come from SciPy / statsmodels / NumPy
// (tests/fixtures/make-reference.py).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadApp } = require('./load-app');

const app = loadApp();
const ref = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'reference-values.json'), 'utf8'));
const close = (got, want, tol, label) => assert.ok(Math.abs(got - want) <= tol * Math.max(1, Math.abs(want)), `${label}: got ${got}, reference ${want}`);
const ALT = { 'two-sided': 'two.sided', less: 'less', greater: 'greater' };

test('summary input: one-sample t, one-sample z, Welch t and two-proportion z match SciPy / statsmodels', () => {
    for (const [alt, want] of Object.entries(ref.summary.one_t)) {
        const r = app.computeOneSampleTFromSummary(25, 16.2, 2.5, 15, 0.05, ALT[alt]);
        close(r.tStatistic, want.t, 1e-12, `one-sample t ${alt}`); close(r.pValue, want.p, 1e-10, `one-sample p ${alt}`);
    }
    for (const [alt, want] of Object.entries(ref.summary.one_z)) {
        const r = app.computeOneSampleZFromSummary(36, 15.8, 2, 15, 0.05, ALT[alt]);
        close(r.zStatistic, want.z, 1e-12, `z ${alt}`); close(r.pValue, want.p, 1e-10, `z p ${alt}`);
    }
    for (const [alt, want] of Object.entries(ref.summary.welch)) {
        const r = app.computeTwoSampleTFromSummary(30, 82, 8, 35, 78, 10, 0.05, ALT[alt]);
        close(r.tStatistic, want.t, 1e-10, `Welch t ${alt}`); close(r.pValue, want.p, 1e-9, `Welch p ${alt}`);
    }
    for (const [alt, want] of Object.entries(ref.summary.two_prop)) {
        const r = app.computeTwoProportionZTest(45, 120, 30, 110, 0.05, ALT[alt]);
        close(r.zStatistic, want.z, 1e-10, `two-proportion z ${alt}`); close(r.pValue, want.p, 1e-9, `two-proportion p ${alt}`);
    }
});

test('pooled-variance two-sample t matches scipy (equal_var=True), from summary and from raw data', () => {
    for (const [alt, want] of Object.entries(ref.summary.pooled)) {
        const r = app.computeTwoSampleTFromSummary(30, 82, 8, 35, 78, 10, 0.05, ALT[alt], true);
        close(r.tStatistic, want.t, 1e-10, `pooled t ${alt}`); close(r.pValue, want.p, 1e-9, `pooled p ${alt}`); assert.equal(r.df, 63);
    }
    for (const [alt, want] of Object.entries(ref.pooled_raw)) {
        const r = app.computeTwoSampleTTest(ref.x, ref.y, 0.05, ALT[alt], true);
        close(r.tStatistic, want.t, 1e-10, `pooled raw t ${alt}`); close(r.pValue, want.p, 1e-9, `pooled raw p ${alt}`);
    }
});

test('summary input: raw data and its own summary give the same test result', () => {
    const data = [12, 15, 14, 16, 13, 15, 14, 17, 16, 15];
    const n = data.length, mean = data.reduce((a, b) => a + b) / n, sd = Math.sqrt(data.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1));
    const raw = app.computeOneSampleTTest(data, 13, 0.05, 'two.sided'), sum = app.computeOneSampleTFromSummary(n, mean, sd, 13, 0.05, 'two.sided');
    assert.equal(raw.tStatistic, sum.tStatistic); assert.equal(raw.pValue, sum.pValue);
    const paired = app.computePairedTFromSummary(12, 2.5, 3.1, 0.05, 'two.sided');
    close(paired.tStatistic, 2.5 / (3.1 / Math.sqrt(12)), 1e-12, 'paired t from the differences');
});

test('summary input: chi-square from a table of counts matches scipy.stats.chi2_contingency', () => {
    const t = ref.summary.chisq_table;
    const r = app.computeChisquareFromTable(t.table.map(row => row.join(', ')).join('\n'), 0.05);
    close(r.chiSquare, t.chi2, 1e-10, 'chi2'); close(r.pValue, t.p, 1e-9, 'p'); assert.equal(r.df, t.df);
});

test('summary input: impossible values are refused with a message, not a NaN', () => {
    for (const r of [app.computeOneSampleTFromSummary(1, 5, 2, 4, 0.05, 'two.sided'), app.computeOneSampleTFromSummary(10, 5, 0, 4, 0.05, 'two.sided'),
        app.computeOneSampleZFromSummary(10, 5, -1, 4, 0.05, 'two.sided'), app.computeTwoSampleTFromSummary(10, 1, 0, 10, 2, 0, 0.05, 'two.sided'),
        app.computeTwoProportionZTest(5, 4, 1, 10, 0.05, 'two.sided'), app.computeTwoProportionZTest(0, 10, 0, 10, 0.05, 'two.sided'),
        app.computeChisquareFromTable('1, 2\n3', 0.05), app.computeChisquareFromTable('0, 0\n3, 4', 0.05)]) {
        assert.equal(r.error, true); assert.ok(r.message.length > 10);
    }
});

test('every hypothesis test summary carries a chart spec with its statistic, critical value and alternative', () => {
    const r = app.computeOneSampleTFromSummary(25, 16.2, 2.5, 15, 0.05, 'two.sided');
    assert.equal(r.chart.dist, 't'); assert.equal(r.chart.df, 24); close(r.chart.stat, r.tStatistic, 1e-15, 'stat');
    close(r.chart.critical.upper, app.tCriticalValue(0.025, 24), 1e-12, 'upper'); close(r.chart.critical.lower, -app.tCriticalValue(0.025, 24), 1e-12, 'lower');
    const g = app.computeOneSampleZFromSummary(36, 15.8, 2, 15, 0.05, 'greater');
    assert.equal(g.chart.dist, 'z'); assert.equal(g.chart.critical.lower, null); close(g.chart.critical.upper, 1.6448536269514722, 1e-9, 'one-sided z');
});

test('density functions agree with scipy.stats on a grid', () => {
    const d = ref.density;
    d.t_pdf.forEach(([x, df, v]) => close(app.tPDF(x, df), v, 1e-11, `tPDF(${x}, ${df})`));
    d.chi2_pdf.forEach(([x, df, v]) => close(app.chiSquarePDF(x, df), v, 1e-11, `chiSquarePDF(${x}, ${df})`));
    d.f_pdf.forEach(([x, a, b, v]) => close(app.fPDF(x, a, b), v, 1e-11, `fPDF(${x}, ${a}, ${b})`));
    d.exp_pdf.forEach(([x, r, v]) => close(app.exponentialPDF(x, r), v, 1e-12, `exponentialPDF(${x}, ${r})`));
    d.poisson_pmf.forEach(([k, l, v]) => close(app.poissonPMF(k, l), v, 1e-11, `poissonPMF(${k}, ${l})`));
    d.weibull_cdf.forEach(([x, k, l, v]) => close(app.get('PLOT_DISTRIBUTIONS').weibull.cdf(x, { shape: k, scale: l }), v, 1e-12, `weibull cdf(${x})`));
});

test('Probability Calculator matches scipy.stats for every kind of question', () => {
    for (const [dist, params, question, a, b, want] of ref.probcalc) {
        const r = app.computeProbCalcWithSteps(dist, params, question, a, b);
        assert.ok(!r.error, `${dist} ${question}: ${r.message}`);
        close(r.probability, want, 1e-9, `${dist} ${question} ${a} ${b}`);
    }
    assert.equal(app.computeProbCalcWithSteps('normal', { mean: 0, stdDev: 1 }, 'eq', 1, 0).error, true);
    assert.equal(app.computeProbCalcWithSteps('normal', { mean: 0, stdDev: -1 }, 'le', 1, 0).error, true);
    assert.equal(app.computeProbCalcWithSteps('normal', { mean: 0, stdDev: 1 }, 'between', 3, 1).error, true);
});

test('grouped data: value/frequency tables match the expanded sample, class tables match midpoint expansion', () => {
    const v = ref.grouped_values, a = app.computeGroupedDataWithSteps(v.text);
    assert.equal(a.n, v.n); close(a.mean, v.mean, 1e-12, 'mean'); close(a.median, v.median, 1e-12, 'median'); close(a.sampleStdDev, v.sd, 1e-12, 'sd');
    const c = ref.grouped_classes, b = app.computeGroupedDataWithSteps(c.text);
    assert.equal(b.type, 'classes'); assert.equal(b.n, c.n); close(b.mean, c.mean, 1e-12, 'class mean'); close(b.sampleStdDev, c.sd, 1e-12, 'class sd');
    // hand-checked textbook example: mean 38.4, median 38
    const h = app.computeGroupedDataWithSteps('10-20, 5\n20-30, 8\n30-40, 15\n40-50, 12\n50-60, 7\n60-70, 3');
    close(h.mean, 38.4, 1e-12, 'textbook mean'); close(h.median, 38, 1e-12, 'textbook median');
    assert.equal(app.computeGroupedDataWithSteps('10-20, -1').error, true);
    assert.equal(app.computeGroupedDataWithSteps('hello').error, true);
});

test('exact small-sample methods match scipy (Fisher, McNemar binomial) and brute-force enumeration (runs test)', () => {
    ref.exact.fisher.forEach(([a, b, c, d, want]) => close(app.fisherExact2x2(a, b, c, d), want, 1e-10, `Fisher [${a},${b};${c},${d}]`));
    ref.exact.mcnemar.forEach(([b, c, want]) => close(app.mcNemarExactPValue(b, c), want, 1e-10, `McNemar exact b=${b} c=${c}`));
    for (const [n1, n2, table] of ref.exact.runs) {
        for (const [r, [lower, upper]] of Object.entries(table)) close(app.runsExactPValue(+r, n1, n2), Math.min(1, 2 * Math.min(lower, upper)), 1e-10, `runs exact n1=${n1} n2=${n2} R=${r}`);
        const pmf = app.runsExactPMF(n1, n2); close(pmf.reduce((s, p) => s + p, 0), 1, 1e-12, 'runs pmf sums to 1');
    }
});

test('McNemar uses the exact binomial p-value for few discordant pairs and chi-square otherwise; chi-square 2x2 reports Fisher', () => {
    const small = app.computeMcNemarTest('20, 3, 9, 18', 0.05), large = app.computeMcNemarTest('20, 15, 30, 18', 0.05);
    assert.equal(small.exact, true); close(small.pValue, app.mcNemarExactPValue(3, 9), 1e-15, 'exact used');
    assert.equal(large.exact, false); close(large.pValue, large.chiPValue, 1e-15, 'chi-square used');
    const t = app.computeChisquareFromTable('3, 1\n1, 3', 0.05);
    close(t.fisherP, app.fisherExact2x2(3, 1, 1, 3), 1e-15, 'Fisher reported for 2x2'); assert.equal(app.computeChisquareFromTable('3, 1, 2\n1, 3, 4', 0.05).fisherP, null);
});

test('one-way ANOVA from group summaries matches the definition (scipy) and the raw-data ANOVA on the same samples', () => {
    const a = ref.summary.anova, r = app.computeANOVAFromSummary(a.rows.map(([name, n, mean, sd]) => ({ name, n, mean, sd })), 0.05);
    close(r.fStatistic, a.F, 1e-12, 'F'); close(r.pValue, a.p, 1e-10, 'p'); assert.deepEqual([r.dfBetween, r.dfWithin], a.df);
    // the same data as raw values: summary of each group -> same F as f_oneway
    const g = ref.summary.anova_raw.groups, rows = g.map((v, i) => { const n = v.length, m = v.reduce((x, y) => x + y) / n; return { name: 'G' + i, n, mean: m, sd: Math.sqrt(v.reduce((x, y) => x + (y - m) ** 2, 0) / (n - 1)) }; });
    close(app.computeANOVAFromSummary(rows, 0.05).fStatistic, ref.summary.anova_raw.F, 1e-10, 'F from the raw samples');
    assert.equal(app.computeANOVAFromSummary([{ name: 'A', n: 5, mean: 1, sd: 0 }, { name: 'B', n: 5, mean: 2, sd: 0 }], 0.05).error, true);
    assert.equal(app.computeANOVAFromSummary(app.parseAnovaSummaryRows('A, 12, 23.5\nB, 15, 29.8, 2.6'), 0.05).error, true);
});
